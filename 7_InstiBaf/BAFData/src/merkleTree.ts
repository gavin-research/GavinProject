import { randomBytes } from "node:crypto";
import jsSHA from "jssha";

const generate = (data: Object) => {
  //Genera un salt en base 64
  const salt = randomBytes(256).toString("base64");

  let leafs = [];
  let baseLeafs = [];
  let salts = [];

  for (const [key, value] of Object.entries(data)) {
    // let selected = false;
    const salt = randomBytes(256).toString("base64");

    //Creates kmac obj
    const kmac = new jsSHA("KMAC128", "TEXT", {
      kmacKey: { value: salt, format: "TEXT" },
    });

    kmac.update(key);
    const kmacKey = kmac.getHash("HEX", { outputLen: 256 });
    kmac.update(value);
    const kmacValue = kmac.getHash("HEX", { outputLen: 256 });

    salts.push(salt);
    leafs.push(kmacKey);
    leafs.push(kmacValue);
  }
  if ((leafs.length / 2) % 2 == 1) {
    const salt = randomBytes(256).toString("base64");
    const kmac = new jsSHA("KMAC128", "TEXT", {
      kmacKey: { value: salt, format: "TEXT" },
    });

    kmac.update("auxKey");
    const kmacKey = kmac.getHash("HEX", { outputLen: 256 });
    kmac.update("auxValue");
    const kmacValue = kmac.getHash("HEX", { outputLen: 256 });

    salts.push(salt);
    leafs.push(kmacKey);
    leafs.push(kmacValue);
  }

  const baseTree = generateTree(leafs);

  //Una vez se tiene el arbol normal se prodece a KMAC raiz y anadir salt
  const rootSalt = randomBytes(256).toString("base64");
  const rootKmac = new jsSHA("KMAC128", "TEXT", {
    kmacKey: { value: rootSalt, format: "TEXT" },
  });
  rootKmac.update(baseTree[0][0]);
  const kmacRoot = rootKmac.getHash("HEX", { outputLen: 256 });

  salts.push(rootSalt);
  leafs.push(kmacRoot);

  return { tree: baseTree, salts: salts };
};

const generateTree = (
  leafs: string[],
  tree: Array<string[]> = [],
): string[][] => {
  let nodes = [];

  tree.push(leafs);
  for (let i = 0; i < leafs.length; i = i + 2) {
    const sha = new jsSHA("SHA3-256", "TEXT", { encoding: "UTF8" });

    sha.update(leafs[i]);
    sha.update(leafs[i + 1]);

    const node = sha.getHash("HEX");
    nodes.push(node);
  }

  if (nodes.length == 1) {
    //Este caso es cuando es la raiz
    tree.push(nodes);
    return tree;
  } else {
    return generateTree(nodes, tree);
  }
};

// /**
//  * @param {string[][]} tree
//  * @param {Array<Array<string>>} auxTree
//  * @param {string[]} fields
//  * @param {number} level
//  * @returns
//  */
// const trimingTree = (tree, fields, level = 0, auxTree = []) => {
//   // const root = tree[tree.length];

//   if (level == tree.length - 1) {
//     return auxTree;
//   }

//   // console.log('Arbol: ', tree, 'con nivel: ', level);
//   if (level == 0) {
//     auxTree = new Array(tree.length);
//     tree.forEach((level, index) => {
//       auxTree[index] = new Array(level.length).fill("yes", 0);
//     });

//     for (let j = 0; j < tree[0].length; j += 2) {
//       let find = false;
//       fields.forEach((field) => {
//         if (tree[0][j] == field) {
//           // tree[0][j] = 'yes';
//           find = true;
//         }
//       });

//       if (!find) {
//         auxTree[0][j] = "no";
//         auxTree[0][j + 1] = "no";
//       }
//     }
//   } else {
//     for (let i = 0; i < tree[level].length; ++i) {
//       const l1 = auxTree[level - 1][1 * i + i];
//       const l2 = auxTree[level - 1][2 * i + 1];
//       if (l1 == "no" && l2 == "no") auxTree[level][i] = "no";
//     }
//   }

//   return trimingTree(tree, fields, ++level, auxTree);
// };

export { generate };
