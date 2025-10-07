// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.19;

import "@hyperledger-labs/yui-ibc-solidity/contracts/core/OwnableIBCHandler.sol";
import "solidity-bytes-utils/contracts/BytesLib.sol";
import "../lib/PacketMssg.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract SCAccess is IIBCModule {
    IBCHandler ibcHandler;

    using BytesLib for *;

    address private owner;

    enum Acceso {
        no_registro, // por defecto
        acceso_total, //acceso mediante caso 1, usuario-tercero
        acceso_parcial, //acceso mediante caso 2, usuario-tercero info parcial
        acceso_usuario_y_terceros_total, //acceso mediante caso 3, usuario permite: issuer-tercero
        acceso_denegado //acceso otorgado previamente PERO ELIMINADO posteriormente
    }

    Acceso constant defaultaccess = Acceso.no_registro;

    address[][] public entidades1cert;
    address[][][] public entidades;

    //mapping the issuers validos en el modelo, address -> nombre de la entidad issuer
    mapping(address => string) private valid_issuers;

    //mapping codigo del certificado - holder
    mapping(string => address) private holders;

    //mapping espejo del anterior para el getAccessList
    mapping(address => string[]) public holdersEspejo;
    //mapping codigo - verifier - permisos de acceso
    mapping(string => mapping(address => Acceso)) public access;
    //mapping provisional verifier - ultima hash cifrada y salteada recibida
    mapping(address => string) private _mensajin;
    //mapping usuario - nonce para firmas
    mapping(address => uint256) private nonce_sign;

    //mappings necesarios para manejo sobre los tipos de acceso para cada verificador y certificado
    //mapping direccion - tipo de acceso
    mapping(address => mapping(address => Acceso)) public accesslist;
    //mapping holder - certificados de ese holder - tipos de acceso - verifiers para cada tipo de accceso
    mapping(address => mapping(string => mapping(Acceso => address[])))
        public accesslista;
    //mapping holder - entidades-certificado-tipo de acceso
    mapping(address => address[][][]) public userEntidades;

    //estructura de firma empleada para validar al usuario
    struct FirmaValidacion {
        bytes32 _hashCodeCert;
        bytes32 _r;
        bytes32 _s;
        uint8 _v;
    }

    //parametros para las conexiones del relayer
    struct RelayerParams {
        string sourcePort;
        string sourceChannel;
        uint64 timeoutHeight;
    }

    constructor(IBCHandler ibcHandler_) public {
        owner = msg.sender;

        ibcHandler = ibcHandler_;

        // holders[
        //     "0x59b255da8e43c684fbd68f9890222e9d242d65bd7947ef732fd4735658c204e0"
        // ] = 0xEca8bB9Be63164Ff5b9F1e0a3a6fC8b369E8455F;

        // holdersEspejo[0xEca8bB9Be63164Ff5b9F1e0a3a6fC8b369E8455F] = [
        //     "0x59b255da8e43c684fbd68f9890222e9d242d65bd7947ef732fd4735658c204e0"
        // ];

        // //alice puede acceder al certificado Cheddar con esta clave, la clave 1.1
        // access[
        //     "0x59b255da8e43c684fbd68f9890222e9d242d65bd7947ef732fd4735658c204e0"
        // ][0xEca8bB9Be63164Ff5b9F1e0a3a6fC8b369E8455F] = Acceso.acceso_total;

        // accesslista[0xEca8bB9Be63164Ff5b9F1e0a3a6fC8b369E8455F][
        //     "0x59b255da8e43c684fbd68f9890222e9d242d65bd7947ef732fd4735658c204e0"
        // ][Acceso.acceso_total] = [0xEca8bB9Be63164Ff5b9F1e0a3a6fC8b369E8455F];
    }

    event Mint(address indexed to, string message);

    event Gavincall(address indexed to, string message);

    event Transfer(address indexed from, address indexed to, string message);

    event ModifyAccess(
        address indexed entity,
        string certificate,
        Acceso access
    );

    event NonceSign(uint256 nonce);

    event AddedValidIssuer(address issuerAddy, string issuerName);

    event EventoCacnea(
        bytes32 firmaHashCode,
        bytes32 abiFirmaHashCode,
        bytes noncebytes,
        uint256 nonce
    );

    event SendTransfer(
        address indexed from,
        address indexed to,
        string sourcePort,
        string sourceChannel,
        uint64 timeoutHeight,
        string message
    );

    event CertEntites(
        address from,
        string[] certsAddress,
        address[][][] accessList
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "MiniMessage: caller is not the owner");
        _;
    }

    modifier onlyIBC() {
        require(
            msg.sender == address(ibcHandler),
            "MiniMessage: caller is not the ibcHandler"
        );
        _;
    }

    //funcion que devuelve el nombre de una entidad issuer valida en el modelo dada su address
    function getIssuer(address issuer) public view returns (string memory) {
        return valid_issuers[issuer];
    }

    function getNonce(address user) public view returns (uint256) {
        return nonce_sign[user];
    }

    function getHolderofCert(string memory cert) public view returns (address) {
        return holders[cert];
    }

    function getHoldersEspejo(
        address holder
    ) public view returns (string[] memory) {
        return holdersEspejo[holder];
    }

    //Crea una lista de verificadores con diferentes tipos de acceso sobre los certificados
    //poseidos por holder.
    function getAccessList(address holder) public {
        string[] storage certificates = holdersEspejo[holder];

        delete entidades;
        delete entidades1cert;

        Acceso[4] memory tipo_de_acceso = [
            Acceso.acceso_total,
            Acceso.acceso_parcial,
            Acceso.acceso_usuario_y_terceros_total,
            Acceso.acceso_denegado
        ];

        for (uint256 i = 0; i < certificates.length; i++) {
            for (uint j = 0; j < 4; j++) {
                Acceso acceso = tipo_de_acceso[j];
                address[] memory entidad = accesslista[holder][certificates[i]][
                    acceso
                ];
                entidades1cert.push(entidad);
            }
            entidades.push(entidades1cert);
            delete entidades1cert;
        }
        userEntidades[holder] = entidades;
    }

    //Devuelve las entidades a las que el holder ha dado permiso de acceso y a que certificados.
    function getEntidades(
        address holder,
        FirmaValidacion calldata firma
    ) public returns (address[][][] memory) {
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

        emit CertEntites(holder, holdersEspejo[holder], userEntidades[holder]);
        return userEntidades[holder];
    }

    //Permite al usuario, tras verificarse con su firma, modificar el tipo de acceso accessvalue que ha dado a
    // un verificador entity sobre un certificado certificate
    function modifyAccess(
        address entity,
        string memory certificate,
        FirmaValidacion calldata firma,
        Acceso accessvalue
    ) external {
        address signer = _getSigner(firma);
        require(
            firma._hashCodeCert ==
                keccak256(
                    abi.encodePacked(Strings.toString(nonce_sign[signer]))
                ),
            "Invalid signer"
        );
        require(holders[certificate] == signer, "Invalid signer 2");
        require(
            holders[certificate] != entity,
            "Holders cannot remove their own access to a certification"
        );

        nonce_sign[signer] = nonce_sign[signer] + 1;
        //se anade al mapping access la nueva informacion
        access[certificate][entity] = accessvalue;

        //se borra el tipo de acceso previo en el array antes de guardar el nuevo
        Acceso[4] memory tipo_de_acceso = [
            Acceso.acceso_total,
            Acceso.acceso_parcial,
            Acceso.acceso_usuario_y_terceros_total,
            Acceso.acceso_denegado
        ];
        for (uint j = 0; j < 4; j++) {
            Acceso acceso = tipo_de_acceso[j];
            address[] storage entidad = accesslista[signer][certificate][
                acceso
            ];

            for (uint i = 0; i < entidad.length; i++) {
                if (entidad[i] == entity) {
                    for (uint k = i; k < entidad.length - 1; k++) {
                        entidad[k] = entidad[k + 1];
                    }
                    entidad.pop();
                }
            }
        }
        //ya borrado el valor anterior, se anade al mapping accesslista la nueva informacion
        accesslista[signer][certificate][accessvalue].push(entity);

        emit ModifyAccess(entity, certificate, accessvalue);
    }

    //funcion para verificar la firma del usuario
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

    //funcion para enviar un dato message a la otra cadena mediante el relayer
    function sendTransfer(
        string memory message,
        address receiver,
        RelayerParams calldata param,
        FirmaValidacion calldata firma
    ) external {
        address signer = _getSigner(firma);
        require(
            firma._hashCodeCert ==
                keccak256(
                    abi.encodePacked(Strings.toString(nonce_sign[signer]))
                ),
            "Invalid signer"
        );

        nonce_sign[signer] = nonce_sign[signer] + 1;

        if (
            (access[message][signer] == Acceso.acceso_total) ||
            (access[message][signer] == Acceso.acceso_parcial) ||
            (access[message][signer] ==
                Acceso.acceso_usuario_y_terceros_total) ||
            (holders[message] == signer)
        ) {
            _sendPacket(
                MiniMessagePacketData.Data({
                    message: message,
                    sender: abi.encodePacked(signer),
                    receiver: abi.encodePacked(receiver)
                }),
                param.sourcePort,
                param.sourceChannel,
                param.timeoutHeight
            );
            emit SendTransfer(
                signer,
                receiver,
                param.sourcePort,
                param.sourceChannel,
                param.timeoutHeight,
                message
            );
        } else {
            _mensajin[msg.sender] = "NO ACCESS TO CERTIFICATION";
        }
    }

    function mint(address account, string memory message) external onlyOwner {
        require(_mint(account, message));
    }

    function transfer(address to, string memory message) external {
        bool res;
        string memory mssg;
        (res, mssg) = _transfer(msg.sender, to, message);
        require(res, mssg);
    }

    function balanceOf(address account) public view returns (string memory) {
        return _mensajin[account];
    }

    function _mint(
        address account,
        string memory message
    ) internal returns (bool) {
        _mensajin[account] = message; //cacnea
        emit Mint(account, message);
        return true;
    }

    //funcion que recibe un string, y en caso de que sea el esperado, ejecuta la funcion de envio
    //con el valor asociado
    function _gavincall(bytes memory _mssg) internal returns (bool) {
        // entei, que pasa si recibe de scstorage-scdata (address account, bytes memory )
        (address account, string memory message_s) = abi.decode(
            _mssg,
            (address, string)
        );

        //la funcion detecta si el origen del dato es de un usuario o de SCVolcado (y por lo tanto, un
        //dato nuevo). Si el dato hexadecimal comienza por P, es un dato de SCVolcado, y
        //por lo tanto, se anade a la lista de codigos registrados.
        //En caso de que el string comience con I0xI, se trata de un issuer nuevo anadido.
        //En este caso, se incluye en el listado de issuers validos
        //En caso contrario, es un dato solicitado por un usuario recibido de SCData, y se envia
        //al verificador
        bytes memory strBytes = bytes(message_s);
        if (strBytes[0] == "P") {
            bytes memory result = new bytes(strBytes.length - 1);
            for (uint i = 1; i < strBytes.length; i++) {
                result[i - 1] = strBytes[i];
            }
            string memory newdata = string(result); //el code del certificado

            //se guarda el code del certificado en holders y holdersEspejo
            holders[newdata] = account;
            holdersEspejo[account].push(newdata);
            //se anade al holder del certificado con acceso total sobre el mismo
            access[newdata][account] = Acceso.acceso_total;
            accesslista[account][newdata][Acceso.acceso_total].push(account);
        } else if (
            (strBytes[0] == "I") &&
            (strBytes[1] == "0") &&
            (strBytes[2] == "x") &&
            (strBytes[3] == "I")
        ) {
            bytes memory result = new bytes(strBytes.length - 4);
            for (uint i = 4; i < strBytes.length; i++) {
                result[i - 4] = strBytes[i];
            }
            string memory newdata = string(result); //el nombre del issuer sin el codigo I0xI
            valid_issuers[account] = newdata;
        } else {
            if (
                keccak256(abi.encodePacked(message_s)) !=
                keccak256(abi.encodePacked("FAILED"))
            ) {
                _mensajin[account] = message_s;
            } else {
                _mensajin[account] = "Permission = False";
            }
        }
        emit Gavincall(account, message_s);
        return true; //este return esta para comprobaciones, podria devolver un true y ya o nada
    }

    function _transfer(
        address from,
        address to,
        string memory message
    ) internal returns (bool, string memory) {
        if (
            keccak256(abi.encodePacked(_mensajin[from])) !=
            keccak256(abi.encodePacked(message))
        ) {
            return (false, "MiniMessage: Ese mensajin no esta");
        }
        _mensajin[from] = "";
        _mensajin[to] = message;
        emit Transfer(from, to, message);
        return (true, "");
    }

    /// Module callbacks ///

    function onRecvPacket(
        Packet.Data calldata packet,
        address relayer
    ) external virtual override onlyIBC returns (bytes memory acknowledgement) {
        MiniMessagePacketData.Data memory data = MiniMessagePacketData.decode(
            packet.data
        );
        //(address sendercontrato, string memory mensajillo) = abi.decode(data.message, (address, string));
        bytes memory message_s = abi.encode(
            data.receiver.toAddress(0),
            data.message
        ); //aqui mandaria mensajillo en vez de data.message

        //en el momento en el que la Blockchain 2 recibe un string, se invoca a gavincall,
        //funcion provisional que simplifica el proceso de volver a invocar
        //la funcion de envio en caso de que haya recibido un codigo correcto
        bool respuesta = _gavincall(message_s);

        return (_newAcknowledgement(respuesta));
        //_newAcknowledgement(_gavincall(data.receiver.toAddress(0), data.message));
    }

    function onAcknowledgementPacket(
        Packet.Data calldata packet,
        bytes calldata acknowledgement,
        address relayer
    ) external virtual override onlyIBC {
        if (!_isSuccessAcknowledgement(acknowledgement)) {
            _refundTokens(MiniMessagePacketData.decode(packet.data));
        }
    }

    function onChanOpenInit(
        Channel.Order,
        string[] calldata connectionHops,
        string calldata portId,
        string calldata channelId,
        ChannelCounterparty.Data calldata counterparty,
        string calldata version
    ) external virtual override {}

    function onChanOpenTry(
        Channel.Order,
        string[] calldata connectionHops,
        string calldata portId,
        string calldata channelId,
        ChannelCounterparty.Data calldata counterparty,
        string calldata version,
        string calldata counterpartyVersion
    ) external virtual override {}

    function onChanOpenAck(
        string calldata portId,
        string calldata channelId,
        string calldata counterpartyVersion
    ) external virtual override {}

    function onChanOpenConfirm(
        string calldata portId,
        string calldata channelId
    ) external virtual override {}

    function onChanCloseConfirm(
        string calldata portId,
        string calldata channelId
    ) external virtual override {}

    function onChanCloseInit(
        string calldata portId,
        string calldata channelId
    ) external virtual override {}

    // Internal Functions //

    //Envia un paquete de datos (creado con la libreria PacketMssg)
    //por el canal especificado hasta la Blockchain B.
    //El enpaquetado se hace en bytes, la libreria ya la modificamos en el
    //"paso anterior" de int a string para que cuente los saltos a dar para
    //desenpaquetar correctamente. Es Packetmssg.sol, en ../lib

    //No tienes que preocuparte por canales ni puertos, usamos los
    //de serie de YUI original, son muchas librerias y mejor no tocarlo
    function _sendPacket(
        MiniMessagePacketData.Data memory data,
        string memory sourcePort,
        string memory sourceChannel,
        uint64 timeoutHeight
    ) internal virtual {
        (Channel.Data memory channel, bool found) = ibcHandler.getChannel(
            sourcePort,
            sourceChannel
        );
        require(found, "MiniMessage: channel not found");
        ibcHandler.sendPacket(
            Packet.Data({
                sequence: ibcHandler.getNextSequenceSend(
                    sourcePort,
                    sourceChannel
                ),
                source_port: sourcePort,
                source_channel: sourceChannel,
                destination_port: channel.counterparty.port_id,
                destination_channel: channel.counterparty.channel_id,
                data: MiniMessagePacketData.encode(data),
                timeout_height: Height.Data({
                    revision_number: 0,
                    revision_height: timeoutHeight
                }),
                timeout_timestamp: 0
            })
        );
    }

    function _newAcknowledgement(
        bool success
    ) internal pure virtual returns (bytes memory) {
        bytes memory acknowledgement = new bytes(1);
        if (success) {
            acknowledgement[0] = 0x01;
        } else {
            acknowledgement[0] = 0x00;
        }
        return acknowledgement;
    }

    function _isSuccessAcknowledgement(
        bytes memory acknowledgement
    ) internal pure virtual returns (bool) {
        require(acknowledgement.length == 1);
        return acknowledgement[0] == 0x01;
    }

    //no aplica
    function _refundTokens(
        MiniMessagePacketData.Data memory data
    ) internal virtual {
        require(_mint(data.sender.toAddress(0), data.message));
    }
}
