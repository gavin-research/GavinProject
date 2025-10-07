# Portal Uni

Este proyecto contiene la Web con la que interactúa la institucion que se comunica con el BAFData

## Configuración
Fichero `.env` con la URL del BAF
```bash
BAF_URL='http://localhost:3000'
```

## Uso
### Local
```bash
nvm use
npm run dev
```

### Producción
Es necesario que la máquina tenga abierto el puerto 80
#### Construir
```bash
nvm use
npm run build
```

#### Servir
Servidor simple HTTP a puerto 300
```bash
npm i -g pm2
pm2 start build/index.js
```
Ya podemos acceder con `http://dns.name.com:3000`

Añadir certificados SSL
```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https &&
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg &&
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list &&
sudo apt update &&
sudo apt install caddy
sudo mv Caddyfile /etc/caddy/Caddyfile
caddy start
```


## Estructura
El código de esta web sigue el formato usado en Svelte Kit.
La gran parte del código se encuentra dentro del directorio `./src` la cual tiene la siguiente estructura en su interior:

- components: componentes reutilizables de la web (HTML)
- lib: todas las funciones de la web (JS)
- routes: estructura de la web (HTML)
