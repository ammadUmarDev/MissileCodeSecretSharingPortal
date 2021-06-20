import socket
import os
from _thread import *
import random
from math import ceil
from decimal import Decimal

# Shamir's Algorithm
FIELD_SIZE = 10 ** 5
N = 5
T = 3
SECRET = random.randint(111111, 999999)


def reconstruct_secret(shares):
    """
    Combines individual shares (points on graph)
    using Lagranges interpolation.

    `shares` is a list of points (x, y) belonging to a
    polynomial with a constant of our key.
    """
    sums = 0
    prod_arr = []

    for j, share_j in enumerate(shares):
        xj, yj = share_j
        prod = Decimal(1)

        for i, share_i in enumerate(shares):
            xi, _ = share_i
            if i != j:
                prod *= Decimal(Decimal(xi) / (xi - xj))

        prod *= yj
        sums += Decimal(prod)

    return int(round(Decimal(sums), 0))


def polynom(x, coefficients):
    """
    This generates a single point on the graph of given polynomial
    in `x`. The polynomial is given by the list of `coefficients`.
    """
    point = 0
    # Loop through reversed list, so that indices from enumerate match the
    # actual coefficient indices
    for coefficient_index, coefficient_value in enumerate(coefficients[::-1]):
        point += x ** coefficient_index * coefficient_value
    return point


def coeff(t, secret):
    """
    Randomly generate a list of coefficients for a polynomial with
    degree of `t` - 1, whose constant is `secret`.

    For example with a 3rd degree coefficient like this:
        3x^3 + 4x^2 + 18x + 554

        554 is the secret, and the polynomial degree + 1 is
        how many points are needed to recover this secret.
        (in this case it's 4 points).
    """
    coeff = [random.randrange(0, FIELD_SIZE) for _ in range(t - 1)]
    coeff.append(secret)
    return coeff


def generate_shares(n, m, secret):
    """
    Split given `secret` into `n` shares with minimum threshold
    of `m` shares to recover this `secret`, using SSS algorithm.
    """
    coefficients = coeff(m, secret)
    shares = []

    for i in range(1, n + 1):
        x = random.randrange(1, FIELD_SIZE)
        shares.append((x, polynom(x, coefficients)))

    return shares


ServerSocket = socket.socket()
host = '127.0.0.1'
port = 1233
ThreadCount = 0

try:
    ServerSocket.bind((host, port))
except socket.error as e:
    print(str(e))

print(f'Missile Codes: {SECRET}')
shares = generate_shares(N, T, SECRET)
print(f'Missile Codes Shares: {", ".join(str(share) for share in shares)}')

print('Waitiing for a Connection..')
ServerSocket.listen(5)


def threaded_client(connection,threadCount,Code):
    connection.send(str.encode('Welcome to the Servern'))
    while True:
        # data = connection.recv(2048)
        data = Code
        reply = 'Server Says: ' + str(data[0]) + str(data[1])
        if not data:
            break
        # connection.sendall(str.encode(reply))
        connection.sendall(str.encode(str(data[0])  +";"+ str(data[1])))
    connection.close()


while True:
    Client, address = ServerSocket.accept()
    print('Connected to: ' + address[0] + ':' + str(address[1]))
    ThreadCount += 1
    start_new_thread(threaded_client, (Client,ThreadCount,shares[ThreadCount], ))
    print('Thread Number: ' + str(ThreadCount))
ServerSocket.close()
