#!/bin/bash

echo "generating RSA server.key"
openssl genrsa -out server_rsa.key 2048
echo "generating EC server.key"
openssl ecparam -genkey -name secp384r1 -out server_ec.key
echo "creating server.crt"
openssl req -new -x509 -sha256 -key server_rsa.key -out server.crt -batch -days 365