### Prerequisites

These instructions are based on Ubuntu 18.04.

Install NodeJS and recommended Systemd dependency:
```
apt install nodejs npm libsystemd-dev
```

**Note:** Systemd development files need to be installed before application installation to make Systemd notifications work. Otherwise installation gives an error regarding to `sd-notify` which can be ignored if Systemd notifications are not needed.

##### Running behind proxy

If application is served under some non-root HTTP pathname, reverse proxy server should add `X-Forwarded-Path` header to requests amongst other typical proxy headers. Also `trustProxy` configuration option has to have appropriate value - see [Express behind proxies](https://expressjs.com/en/guide/behind-proxies.html).

### Quick start

```
npm install -g ssh://git@github.com/keijokapp/time-travel-estonia.git

time-travel-estonia /path/to/config-file.json
```

Example configuration is shown in [config_sample.json](config_sample.json). Only `database` and `listen` options are required. Other options can be provided to turn on features.

 | Option | Description |
 |--------|-------------|
 | `listen` | Listener configuration - `"systemd"` in case of Systemd socket or `object` |
 | `listen.port`, `listen.address` | Listen address (optional) and port |
 | `listen.path`, `listen.mode` | UNIX socket path and mode (optional) |
 | `trustProxy` | (optional) Policy used to handle proxy headers; See [Express behind proxies](https://expressjs.com/en/guide/behind-proxies.html) for possible values. |
 | `database` | Database URL (CouchDB) or location on disk (LevelDB) |

### Installing as Systemd service:
```
useradd -d /var/lib/time-travel-estonia -s /bin/false -r time-travel-estonia
[ -e /etc/time-travel-estonia/config.json ] || \
    install -D -m640 --group=time-travel-estonia "$(npm root -g)/time-travel-estonia/config_sample.json" \
    /etc/time-travel-estonia/config.json
install -D "$(npm root -g)/time-travel-estonia/time-travel-estonia.service" \
    /usr/local/lib/systemd/system/time-travel-estonia.service
systemctl daemon-reload
systemctl enable time-travel-estonia
systemctl start time-travel-estonia
```
