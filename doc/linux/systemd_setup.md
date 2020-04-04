# Setting up SystemD to start onefleet

## Requirements

- Node.js
- npm
- onefleet "service-user"

## Setup

Make sure 'nodejs' and 'npm' are installed. For debian use:

```bash
sudo apt install nodejs npm
```

Setup the application under '/opt':

```bash
sudo useradd -r onefleet
sudo git clone https://gitlab.com/civilmrcc/onefleet -C /opt/onefleet
sudo chown onefleet.onefleet -R /opt/onefleet
sudo su onefleet -s /bin/bash
cd /opt/onefleet && npm i
```

Copying the service file and start the daemon:

```bash
sudo cp /opt/onefleet/doc/linux/example/onefleet.service /etc/systemd/system
sudo systemctl daemon-reload
sudo systemctl start onefleet
```
