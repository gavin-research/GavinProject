// import { sha256 } from 'js-sha256';
import jsSHA from 'jssha';
import { t } from '$lib/lang/translations';

//TODO extraer todo a libreria

/**
 * @param {Object} data
 * @param {string[]} fields
 * @param {string[]} salts
 * @returns
 */
const generate = (data, fields, salts) => {
	let leafs = [];
	let baseLeafs = [];
	let saltsSelected = [];

	try {
		if (fields == undefined) {
			throw t.get('error.no_fields');
		}
		if (salts == []) {
			throw t.get('error.no_salts');
		}

		let saltIndex = 0;
		for (const [key, value] of Object.entries(data)) {
			let selected = false;
			console.log(salts[saltIndex]);
			const kmac = new jsSHA('KMAC128', 'TEXT', {
				kmacKey: { value: salts[saltIndex], format: 'TEXT' }
			});

			kmac.update(key);
			const hashKey = kmac.getHash('HEX', { outputLen: 256 });
			kmac.update(value.toString());
			const hashValue = kmac.getHash('HEX', { outputLen: 256 });

			leafs.push(hashKey);
			leafs.push(hashValue);

			for (const i of fields) {
				if (i == key) {
					selected = true;
					saltsSelected.push(salts[saltIndex]);
					baseLeafs.push(key);
					baseLeafs.push(value);
				}
			}

			if (!selected) {
				console.log(`Hash => ${key}: ${value}`);
				baseLeafs.push(hashKey);
				baseLeafs.push(hashValue);
			}

			//Se aumenta el indice para poder coger el siguiente salt
			++saltIndex;
		}
		if ((leafs.length / 2) % 2 == 1) {
			const kmac = new jsSHA('KMAC128', 'TEXT', {
				kmacKey: { value: salts[saltIndex], format: 'TEXT' }
			});

			kmac.update('auxKey');
			const kmacKey = kmac.getHash('HEX', { outputLen: 256 });
			kmac.update('auxValue');
			const kmacValue = kmac.getHash('HEX', { outputLen: 256 });

			leafs.push(kmacKey);
			leafs.push(kmacValue);
		}

		// console.log('N Campos: ', index, ' valores: ', leafs);

		const baseTree = generateTree(leafs);
		baseTree[0] = baseLeafs;
		// console.log('Arbol Normal: ', baseTree);

		const trimTree = trimingTree(baseTree, fields);
		// console.log('Arbol Trim: ', trimTree);
		// console.log('Hojas: ', leafs);

		for (let i = 0; i < baseTree.length; ++i) {
			//Se avanza de a 2 porque los valores estan junto a sus parejas
			for (let j = 0; j < baseTree[i].length; j = 2 + j) {
				//Si el valor es necesario su pareja tambien lo es
				if (trimTree[i][j] == 'yes') {
					trimTree[i][j] = baseTree[i][j];
					trimTree[i][j + 1] = baseTree[i][j + 1];
				}
			}
		}

		//Elimino la raíz;
		// console.log('Raíz: ', trimTree[trimTree.length - 1]);
		trimTree.pop();
		// console.log(trimTree);

		return {
			challengeTree: trimTree,
			fields: fields,
			salts: saltsSelected,
			name: '',
			date: '',
			holder: '',
			sign: {}
		};
	} catch (e) {
		// console.log(e);
		throw `Error: ${e}`;
	}
};

/**
 * @param {string[]} leafs
 * @param {Array<string[]>} tree
 * @returns {string[][]}
 */
const generateTree = (leafs, tree = []) => {
	let nodes = [];

	tree.push(leafs);
	for (let i = 0; i < leafs.length; i = i + 2) {
		const sha = new jsSHA('SHA3-256', 'TEXT', { encoding: 'UTF8' });

		sha.update(leafs[i]);
		sha.update(leafs[i + 1]);

		const node = sha.getHash('HEX');

		nodes.push(node);
	}

	if (nodes.length == 1) {
		tree.push(nodes);
		return tree;
	} else {
		return generateTree(nodes, tree);
	}
};

/**
 * @param {string[][]} tree
 * @param {Array<Array<string>>} auxTree
 * @param {string[]} fields
 * @param {number} level
 * @returns {string[][]}
 */
const trimingTree = (tree, fields, level = 0, auxTree = []) => {
	// const root = tree[tree.length];

	if (level == tree.length - 1) {
		return auxTree;
	}

	// console.log('Arbol: ', tree, 'con nivel: ', level);
	if (level == 0) {
		auxTree = new Array(tree.length);
		tree.forEach((level, index) => {
			auxTree[index] = new Array(level.length).fill('yes', 0);
		});

		for (let j = 0; j < tree[0].length; j += 2) {
			let find = false;
			fields.forEach((field) => {
				if (tree[0][j] == field) {
					// tree[0][j] = 'yes';
					find = true;
				}
			});

			if (!find) {
				auxTree[0][j] = 'no';
				auxTree[0][j + 1] = 'no';
			}
		}
	} else {
		for (let i = 0; i < tree[level].length; ++i) {
			const l1 = auxTree[level - 1][1 * i + i];
			const l2 = auxTree[level - 1][2 * i + 1];
			if (l1 == 'no' && l2 == 'no') auxTree[level][i] = 'no';
		}
	}

	return trimingTree(tree, fields, ++level, auxTree);
};

/**
 * @param {string[][]} tree
 * @param {string} root
 * @param {string[]} fields
 * @param {string[]} salts
 * @return {boolean}
 */
const check = (tree, root, fields, salts) => {
	try {
		//1. Si la raiz esta firmada por la entidad procedo a verificar los campos
		let saltIndex = 0;
		//Genera el árbol hasheando solo con los campos que no estan previamente
		for (let i = 0; i < tree[0].length; i = i + 2) {
			for (let j = 0; j < fields.length; ++j) {
				if (tree[0][i] == fields[j]) {
					const kmac = new jsSHA('KMAC128', 'TEXT', {
						kmacKey: { value: salts[saltIndex], format: 'TEXT' }
					});

					kmac.update(tree[0][i]);
					tree[0][i] = kmac.getHash('HEX', { outputLen: 256 });
					kmac.update(tree[0][i + 1]);
					tree[0][i + 1] = kmac.getHash('HEX', { outputLen: 256 });

					saltIndex++;
					break;
				}
			}
		}

		//Verifica sus capas hasta la raíz
		for (let i = 0; i < tree.length - 1; ++i) {
			console.log('Checkin layers: ', i, i + 1);
			if (!checkLayer(tree[i], tree[i + 1])) {
				throw `${t.get('error.layers')} ${i}-${i + 1}`;
			}
		}

		if (!checkLayer(tree[tree.length - 1], [root])) {
			throw t.get('error.root');
		}

		// console.log('Verificación correcta');
		return true;
	} catch (e) {
		console.log(e);
		return false;
	}
};
/**
 * @param {string[]} baseLayer
 * @param {string[]} upperLayer
 * @return {boolean}
 */
const checkLayer = (baseLayer, upperLayer) => {
	try {
		if (baseLayer.length != upperLayer.length * 2) {
			throw t.get('error.layers_length');
		}

		for (let i = 0; i < baseLayer.length; i = i + 2) {
			if (baseLayer[i] != 'no') {
				const hash1 = baseLayer[i];
				const hash2 = baseLayer[i + 1];

				let proof;
				if (i == 0) {
					proof = upperLayer[0];
				} else {
					proof = upperLayer[i / 2];
				}
				const sha = new jsSHA('SHA3-256', 'TEXT', { encoding: 'UTF8' });

				sha.update(hash1);
				sha.update(hash2);
				const shaProof = sha.getHash('HEX');

				if (shaProof != proof) {
					throw `${t.get('error.hash')}: ${shaProof} - ${proof}`;
				}
			}
		}

		return true;
	} catch (e) {
		console.log(e);
		return false;
	}
};

export { generate, check };
