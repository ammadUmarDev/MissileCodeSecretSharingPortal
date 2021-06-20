import socket
import sys

ClientSocket = socket.socket()
host = '127.0.0.1'
port = 1233

print('Waiting for connection')
try:
    ClientSocket.connect((host, port))
except socket.error as e:
    print(str(e))

Response = ClientSocket.recv(1024)
ClientSocket.send(str.encode("Code Recieved"))
Response = ClientSocket.recv(1024)
print(Response.decode('utf-8'))
# while True:
#     #print(str(sys.argv[1],sys.argv[2]))
#     #Input = input('Say Something: ')
#     ClientSocket.send(str.encode("Code Recieved"))
#     Response = ClientSocket.recv(1024)
#     print(Response.decode('utf-8'))

ClientSocket.close()