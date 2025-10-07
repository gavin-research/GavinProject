// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "@openzeppelin/contracts/utils/Strings.sol";

contract SCAuthAccess {
    address scaccess;

    event SCAccessAdd(address scaccess);
    event NonceInitalized(address indexed user, uint256 nonce);
    event GotCertificateID(
        address indexed user,
        string certificateIDs,
        string codeID
    );
    event GotAllCertificateID(address indexed user, string[] certificateIDs);

    mapping(string => address) public holdersID;
    mapping(address => string[]) public holdersEspejoID;
    mapping(address => uint256) private nonce_sign;
    mapping(string => string) public coderegid;

    struct FirmaValidacion {
        bytes32 _hashCodeCert;
        bytes32 _r;
        bytes32 _s;
        uint8 _v;
    }

    //mapping (string => address) public holdersKey;
    //mapping(address => string[]) public holdersEspejoKey;
    //event GotCertificateKey(address indexed user, string[] certificateKeys);

    constructor() {
        //un par de datos ya introducidos para pruebas
        // holdersID[
        //     "0xf73910ddb3e35a2db69926e7d422df45a52751d09bc99ceaed08ed2dd497930e"
        // ] = 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;
        // holdersID[
        //     "0x66de0b546355b8dc6b244662365b8f75b20bddb2341fbd313a8492556d78c11e"
        // ] = 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;

        // holdersEspejoID[0x5B38Da6a701c568545dCfcB03FcB875f56beddC4] = [
        //     "0xf73910ddb3e35a2db69926e7d422df45a52751d09bc99ceaed08ed2dd497930e",
        //     "0x66de0b546355b8dc6b244662365b8f75b20bddb2341fbd313a8492556d78c11e"
        // ];
        //CACNEA SET PROPERLY
        scaccess = 0xD49b00A990515d04cBc790b13fbCdBbd2716231e;
    }

    // update scaccess address en caso de que sea necesario
    function updateSCAccess(address _scaccess) public returns (address) {
        scaccess = _scaccess;
        return scaccess;
    }

    function getSCAccess() public returns (address) {
        emit SCAccessAdd(scaccess);
        return scaccess;
    }

    /// get Nonce for signatures //
    function getNonce(address holder) public returns (uint256) {
        uint256 result;
        if (nonce_sign[holder] != 0) {
            result = nonce_sign[holder];
        } else {
            nonce_sign[holder] = 1000;
            result = nonce_sign[holder];
        }
        emit NonceInitalized(holder, nonce_sign[holder]);
        return result;
    }

    ///// Signer check /////
    function _getSigner(
        FirmaValidacion memory firma
    ) internal pure returns (address) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHashMessage = keccak256(
            abi.encodePacked(prefix, firma._hashCodeCert)
        );
        address signer = ecrecover(
            prefixedHashMessage,
            firma._v,
            firma._r,
            firma._s
        );

        return signer;
    }

    /////////////////// ---- SET ID ------ //////////////7
    //Lo usa la uni para establecer el Identificador regID
    function setCertificateID(
        string memory id,
        string memory code,
        address holder,
        FirmaValidacion memory firma
    ) public returns (bool) {
        address signer = _getSigner(firma);

        require(
            firma._hashCodeCert ==
                keccak256(
                    abi.encodePacked(Strings.toString(nonce_sign[signer]))
                ),
            "Invalid signer"
        );
        require(
            msg.sender == signer,
            "Invalid signer. Msg signer is not the user requested."
        );
        nonce_sign[signer] = nonce_sign[signer] + 1;

        (bool success, bytes memory data) = scaccess.call(
            abi.encodeWithSignature("getIssuer(address)", msg.sender)
        );
        require(success, "Call to SCAccess failed");
        string memory issuer = abi.decode(data, (string));

        if (bytes(issuer).length != 0) {
            coderegid[code] = id;
            holdersID[id] = holder;
            holdersEspejoID[holder].push(id);
            return true;
        } else {
            return false;
        }
    }

    ////////////////---------  GET IDs ------------//////////////////////////////
    //Lo usa el user para recuperar el regID y poder ir a MongoDB y recuperar el dato de ID y descifrarlo con su clave
    function getCertificateID(
        address holder,
        string memory code,
        FirmaValidacion calldata firma
    ) public returns (string memory) {
        address signer = _getSigner(firma);

        require(
            firma._hashCodeCert ==
                keccak256(
                    abi.encodePacked(Strings.toString(nonce_sign[signer]))
                ),
            "Invalid signer"
        );
        require(
            holder == signer,
            "Invalid signer. Msg signer is not the user requested."
        );
        nonce_sign[signer] = nonce_sign[signer] + 1;

        emit GotCertificateID(msg.sender, coderegid[code], code);
        return coderegid[code];
    }

    ////////////////---------  GET ALL IDs ------------//////////////////////////////
    //Lo usa el user para recuperar TODOS los regID asociados a una address
    function getAllCertificateID(
        address holder,
        FirmaValidacion calldata firma
    ) public returns (string[] memory) {
        address signer = _getSigner(firma);

        require(
            firma._hashCodeCert ==
                keccak256(
                    abi.encodePacked(Strings.toString(nonce_sign[signer]))
                ),
            "Invalid signer"
        );
        require(
            holder == signer,
            "Invalid signer. Msg signer is not the user requested."
        );
        nonce_sign[signer] = nonce_sign[signer] + 1;

        emit GotAllCertificateID(msg.sender, holdersEspejoID[msg.sender]);
        return holdersEspejoID[msg.sender];
    }

    //////////////////////////////---------------------------////////////////////////////////////////

    //pruebas despliegue ok eliminar luego --cacnea
    function speak() public view returns (string memory) {
        return "cacnea in da house";
    }

    /**
    function setCertificateKey(string memory key, address holder) public returns(bool){
        holdersKey[key] = holder;
        holdersEspejoKey[holder].push(key);
        return true;
    }

    function getCertificateKey(address holder, FirmaValidacion calldata firma) public returns(string[] memory){
        address signer = _getSigner(firma);

        require(firma._hashCodeCert == keccak256(abi.encodePacked(Strings.toString(nonce_sign[signer]))), "Invalid signer");
        require(holder == signer, "Invalid signer. Msg signer is not the user requested.");
        nonce_sign[signer] = nonce_sign[signer] + 1;

        emit GotCertificateKey(msg.sender, holdersEspejoKey[msg.sender]);
        return holdersEspejoKey[msg.sender];
        //off-chain el usuario lo descifra con su clave privada
    }
*/
}
