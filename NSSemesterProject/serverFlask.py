import io
import os
import json
import subprocess
from decimal import Decimal
from os import environ
from datetime import datetime, time
from flask import Flask, request, make_response, jsonify, send_file, Response, jsonify
from io import BytesIO
import uuid
import bcrypt
app = Flask(__name__)
import secrets
import string
from pathlib import Path
import hashlib
import random
import threading
import atexit
from subprocess import call
from subprocess import Popen
import json

POOL_TIME = 5 #Seconds

# variables that are accessible from anywhere
commonDataStruct = {}
# lock to control access to variable
dataLock = threading.Lock()
# thread handler
yourThread = threading.Thread()

# Shamir's Algorithm
FIELD_SIZE = 10 ** 5
N = 5
T = 3
SECRET = random.randint(111111, 999999)
SHARES = []


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

USERROLES = ["President", "Vice President", "Chief of Army Staff", "Army General 1", "Army General 2"]
UserRoleCount = 0

def random_token_generator(size=16, chars=string.ascii_uppercase + string.digits):
	return ''.join(random.choice(chars) for _ in range(size))

@app.route('/api/authenticateUser', methods=['POST'])
def authenticate():
    global USERROLES
    global UserRoleCount

    if UserRoleCount<5:
        try:
            # Authentication
            timestamp = datetime.now()
            # timestamp = timestamp.strftime("%Y-%m-%d")
            if "Authorization" not in request.headers or request.headers["Authorization"] != "ekjfe2424JKEFEKFJEF":
                response = Response(json.dumps(
                    {"error": 'Authorization failed!'}), mimetype='text/json', status=401)
                return response(environ)

            username = str(request.args["username"])
            password = str(request.args["password"])
            # token = str(request.args["token"])

            passwordFilePath = Path(str(username) + ".xml")
            if passwordFilePath.is_file():
                passwordFile = open(passwordFilePath, "rb")
                valid = bcrypt.checkpw(password.encode(), passwordFile.readline())
                passwordFile = open(Path(str(username) + "512" + ".xml"), "rb")
                userFile = open("authenticatedUsers.txt", "a")
                userFile.write(str(username)+";"+USERROLES[UserRoleCount]+"\n")
                UserRoleCount += 1
                data = {"username": username, "validity": valid}

                response = make_response(jsonify(data), 200)
                response.headers.set('Content-type', "application/json")
                return response
            else:
                data = {'status': 'error', 'exception': 'user does not exist'}
                response = make_response(jsonify(data), 500)
                response.headers.set('Content-type', "application/json")
                return response

        except Exception as e:
            print('Exception:', e)
            data = {'status': 'error', 'exception': str(e)}
            response = make_response(jsonify(data), 500)
            response.headers.set('Content-type', "application/json")
            return response
    else:
        data = {'status': 'error', 'exception': "user role limit reached"}
        response = make_response(jsonify(data), 500)
        response.headers.set('Content-type', "application/json")
        return response

@app.route('/api/createUser', methods=['POST'])
def createUser():
    global USERROLES
    global UserRoleCount

    if UserRoleCount < 5:
        try:
            # Authentication
            timestamp = datetime.now()
            if "Authorization" not in request.headers or request.headers["Authorization"] != "ekjfe2424JKEFEKFJEF":
                response = Response(json.dumps(
                    {"error": 'Authorization failed!'}), mimetype='text/json', status=401)
                return response(environ)
            username = uuid.uuid1()
            print("Generated username: ",username)
            alphabet = string.ascii_letters + string.digits
            password = ''.join(secrets.choice(alphabet) for i in range(20))
            print("Generated password: ", password)
            hasedPassword = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
            passwordFile = open(str(username)+".xml", "wb")
            print("Generated hasedPassword: ", hasedPassword)
            passwordFile.write(hasedPassword)
            passwordFile.close()
            sha512Password = hashlib.sha512(password.encode())
            passwordFile = open(str(username) + "512" + ".xml", "wb")
            print("Generated sha512Password: ", sha512Password)
            passwordFile.write(sha512Password.hexdigest().encode())
            passwordFile.close()
            random_token = random_token_generator()
            data = {"username": username, "password": password, "role":USERROLES[UserRoleCount]}
            response = make_response(jsonify(data), 200)
            response.headers.set('Content-type', "application/json")
            return response

        except Exception as e:
            print('Exception:', e)
            data = {'status': 'error', 'details': "cannot create more users"}
            response = make_response(jsonify(data), 500)
            response.headers.set('Content-type', "application/json")
            return response

    else:
        data = {'status': 'error', 'exception': "user role limit reached"}
        response = make_response(jsonify(data), 500)
        response.headers.set('Content-type', "application/json")
        return response

@app.route('/api/runAuthenticatedUsers', methods=['POST'])
def runAuthenticatedUsers():
    try:
        # missileCode = random.randit(111111,999999)
        userFile = open('authenticatedUsers.txt', 'r')
        users = userFile.readlines()
        count = 0
        for user in users:
            count += 1
            print("Line{}: {}".format(count, user.strip()))
            #exec(open('client.py').read())
            #call(["python", "client.py"])
            #os.system('python client.py')
            clientArgs = user.split(";")
            clientFileName = 'python client .py '+clientArgs[0]+" "+clientArgs[1]
            print(clientFileName)
            subprocess.call('python client .py', creationflags=subprocess.CREATE_NEW_CONSOLE)
        data = {"Status": "users running"}
        response = make_response(jsonify(data), 200)
        response.headers.set('Content-type', "application/json")
        return response

    except Exception as e:
        print('Exception:', e)
        data = {'status': 'error', 'details': "cannot create more users"}
        response = make_response(jsonify(data), 500)
        response.headers.set('Content-type', "application/json")
        return response

@app.route('/api/clearAuthenticatedUsers', methods=['POST'])
def clearAuthenticatedUsers():
    try:
        open('authenticatedUsers.txt', 'w').close()
        data = {"Status": "users cleared"}
        response = make_response(jsonify(data), 200)
        response.headers.set('Content-type', "application/json")
        return response

    except Exception as e:
        print('Exception:', e)
        data = {'status': 'error', 'exception': str(e)}
        response = make_response(jsonify(data), 500)
        response.headers.set('Content-type', "application/json")
        return response


@app.route('/api/shareMissileCode', methods=['POST'])
def shareMissileCode():
    try:
        global SHARES
        print(f'Missile Codes: {SECRET}')
        shares = SHARES
        print(f'Missile Codes Shares: {", ".join(str(share) for share in shares)}')
        userFile = open('authenticatedUsers.txt', 'r')
        users = userFile.readlines()
        count = 0
        for user in users:
            print("Line{}: {}".format(count, user.strip()))
            print(str(shares[count]))
            print(user[:len(user) - 1] + ";" + str(shares[count]))
            users[count] = user[:len(user) - 1] + ";" + str(shares[count]) + "\n"
            count += 1
        with open('authenticatedUsers.txt', 'w') as file:
            file.writelines(users)
        data = {"Status": "missile code shares shared among authenticated users"}
        response = make_response(jsonify(data), 200)
        response.headers.set('Content-type', "application/json")
        return response

    except Exception as e:
        print('Exception:', e)
        data = {'status': 'error', 'exception': str(e)}
        response = make_response(jsonify(data), 500)
        response.headers.set('Content-type', "application/json")
        return response


@app.route('/api/getAuthenticatedUsers', methods=['POST'])
def getAuthenticatedUsers():
    try:
        userFile = open('authenticatedUsers.txt', 'r')
        users = userFile.readlines()
        count = 0
        retList = []
        for user in users:
            print("Line{}: {}".format(count, user.strip()))
            splitUser = user.split(";")
            retList.append({
                "userName": splitUser[0],
                "userRole": splitUser[1]
            })
            count += 1

        data = retList
        response = make_response(json.dumps(data), 200)
        response.headers.set('Content-type', "application/json")
        return response

    except Exception as e:
        print('Exception:', e)
        data = {'status': 'error', 'exception': str(e)}
        response = make_response(jsonify(data), 500)
        response.headers.set('Content-type', "application/json")
        return response

@app.route('/api/recreateSecret', methods=['POST'])
def recreateSecret():
    try:
        userFile = open('authenticatedUsers.txt', 'r')
        users = userFile.readlines()
        count = 0
        userCount = len(request.args)  #str(request.args["username"])
        if userCount!=T:
            data = {'status': 'error', 'details': "insufficient users to reconstruct the code"}
            response = make_response(jsonify(data), 500)
            response.headers.set('Content-type', "application/json")
            return response

        codes=[]
        for user in users:
            print("Line{}: {}".format(count, user.strip()))
            splitUser = user.split(";")
            codes.append(tuple(map(int, splitUser[2][1:-2].split(', '))))
            print(codes)
            count += 1
        pool = random.sample(SHARES, T)
        print(f'Combining shares: {", ".join(str(share) for share in pool)}')
        print(f'Reconstructed secret: {reconstruct_secret(pool)}')
        data = {"missile code" : reconstruct_secret(pool)}
        response = make_response(jsonify(data), 200)
        response.headers.set('Content-type', "application/json")
        return response

    except Exception as e:
        print('Exception:', e)
        data = {'status': 'error', 'exception': str(e)}
        response = make_response(jsonify(data), 500)
        response.headers.set('Content-type', "application/json")
        return response

@app.route('/api/generateMissileCodes', methods=['POST'])
def generateMissileCodes():
    try:
        global N
        N = int(request.args["N"])
        global T
        T = int(request.args["T"])
        global SECRET
        SECRET = random.randint(111111, 999999)
        global SHARES
        SHARES = generate_shares(N, T, SECRET)


        data = {'N': N, 'T': T, 'Secret':SECRET, 'Shares':SHARES}
        response = make_response(jsonify(data), 200)
        response.headers.set('Content-type', "application/json")
        return response

    except Exception as e:
        print('Exception:', e)
        data = {'status': 'error', 'exception': str(e)}
        response = make_response(jsonify(data), 500)
        response.headers.set('Content-type', "application/json")
        return response

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=9080)


