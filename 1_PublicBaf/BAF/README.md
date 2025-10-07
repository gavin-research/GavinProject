# BAF

## Configuración
Para configurar el BAF se hace uso de un fichero `.env` de variables de entorno.

```bash
PORT=3000 #Puerto de ejecución
PUBLIC_KEY =0xEca8bB9Be63164Ff5b9F1e0a3a6fC8b369E8455F  # Clave pública
PRIVATE_KEY =0x1dc0fb343a76df8cdf3857cc5e5e47d8836562a3b9c09650e7c2ded8c00d9bf4 # Clave privada
RPC_SERVER=HTTP://127.0.0.1:8645 # Cadena de acceso
CONTRACT_ABI=./contracts/SCAccess.json # Directorio con ABI de SCAccess
CONTRACT_ADDRESS=0xff77D90D6aA12db33d3Ba50A34fB25401f6e4c4F # Dirección contrato acceso
LOG_PATH=./logs # Directorio de los logs
LOG_RPC_SERVER=https://sepolia.infura.io/v3/f4171377eb114311a14fb41b65c96fd7 # Cadena de logs
LOG_CONTRACT_ABI=./contracts/BAFLog.json # Directorio ABI del Log
LOG_CONTRACT_ADDRESS=0x01beEbeCb802280F35E0328a2cD3609235f75324 # Dirección contrato logs
```
La clave pública y privada es de una cuenta que interactúa con los contratos

## Uso
Para levantar el BAF es necesario crear un fichero `.env`

Una vez creado, se levanta con
```bash
npm run dev
```
