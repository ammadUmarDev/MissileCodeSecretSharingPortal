import React from "react";
import { useState, useEffect } from "react";
import axios from 'axios'

// react-bootstrap components
import {
  Badge,
  Button,
  Card,
  Navbar,
  Nav,
  Table,
  Container,
  Row,
  Col,
  Form,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";

function Dashboard() {
  const getAuthenticatedUsersFromServerURL = "http://172.17.41.60:9080/api/getAuthenticatedUsers";
  const clearAuthenticatedUsersFromServerURL = "http://172.17.41.60:9080/api/clearAuthenticatedUsers";
  const createUserFromServerURL = "http://172.17.41.60:9080/api/createUser";
  const authenticateUserFromServerURL = "http://172.17.41.60:9080/api/authenticateUser";
  const shareMissileCodeFromServerURL = "http://172.17.41.60:9080/api/shareMissileCode";
  const recreateSecretFromServerURL = "http://172.17.41.60:9080/api/recreateSecret";
  const generateMissileCodesFromServerURL = "http://172.17.41.60:9080/api/generateMissileCodes";
  const [authenticatedUsers, setAuthenticatedUsers] = useState([]);
  const [authenticatedUsersUpdated, setauthenticatedUsersUpdated] = useState(true);
  const [authenticateCreateToggle, setauthenticateCreateToggle] = useState(true);
  const [generateCodeToggle, setgenerateCodeToggle] = useState(true);
  const [userName, setuserName] = useState("");
  const [password, setpassword] = useState("");
  const [T, setT] = useState("");
  const [N, setN] = useState("");
  useEffect(() => {
    axios
      .get(getAuthenticatedUsersFromServerURL)
      .then((response) => {
        console.log("result from getAuthenticatedUsers", response);
        setAuthenticatedUsers(response.data);
        console.log("authenticated users", authenticatedUsers);
      })
      .catch((error) => {
        console.log(error);
      });

  }, [authenticatedUsersUpdated]);

  let clearAuthenticatedUsers = () => {
    axios
      .post(clearAuthenticatedUsersFromServerURL)
      .then((response) => {
        console.log("result from getAuthenticatedUsers", response);
        setAuthenticatedUsers(response.data);
        console.log("authenticated users", authenticatedUsers);
      })
      .catch((error) => {
        console.log(error);
      });
    axios
      .get(getAuthenticatedUsersFromServerURL)
      .then((response) => {
        console.log("result from getAuthenticatedUsers", response);
        setAuthenticatedUsers(response.data);
        console.log("authenticated users", authenticatedUsers);
      })
      .catch((error) => {
        console.log(error);
      });

    alert("Authenticated Users Cleared!");
    setauthenticatedUsersUpdated(!authenticatedUsersUpdated);
  }

  let emptyFunction = () => {
    alert("emptyFunction")
  }


  return (
    <>
      <Container fluid>
        <Row>
          <Col md="9">
            <Row>
              <Col lg="12">
                <Card>
                  <Card.Header>
                    <Card.Title as="h4">{authenticateCreateToggle ? "Create User" : "Authenticate User"}</Card.Title>
                    <p className="card-category">{authenticateCreateToggle ? "Generate upto 5 users" : "Authenticate users for secret sharing"}</p>
                  </Card.Header>
                  <Card.Body>
                    {!authenticateCreateToggle ? <div>
                      <form>
                        <p>Username:</p>
                        <input
                          type='text'
                          onChange={(e) => setuserName(e.target.value)}
                        />
                        <p>Password:</p>
                        <input
                          type='text'
                          onChange={(e) => setpassword(e.target.value)}
                        />
                      </form>
                    </div> : <></>}
                    <br></br>
                  </Card.Body>
                  <Card.Footer>
                    <hr></hr>
                    <div className="stats">
                      {authenticateCreateToggle ? <div>
                        <button onClick={() => {
                          axios
                            .post(createUserFromServerURL)
                            .then((response) => {
                              console.log("result from createUser", response);
                              alert(response);
                            })
                            .catch((error) => {
                              console.log(error);
                            });

                        }}>Create</button>
                        <span> </span>
                        <button onClick={() => {
                          setauthenticateCreateToggle(!authenticateCreateToggle);
                        }}>Authenticate</button>
                      </div> : <><button onClick={() => {
                        setauthenticateCreateToggle(!authenticateCreateToggle);
                      }}>Authenticate</button>
                        <span> </span>
                        <button onClick={() => {
                          axios
                            .post(createUserFromServerURL)
                            .then((response) => {
                              console.log("result from createUser", response);

                              alert(response);
                            })
                            .catch((error) => {
                              console.log(error);
                            });
                        }}>Create</button></>}

                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            </Row>
            <Row>
              <Col lg="4" sm="6">
                <Card className="card-stats">
                  <Card.Header>
                    <Card.Title as="h4">Generate Missile Codes</Card.Title>
                    <p className="card-category">Generate missile code and shares using N and T</p>
                    <div>
                      {generateCodeToggle ? <form>
                        <p>T:</p>
                        <input
                          type='text'
                          onChange={(e) => setT(e.target.value)}
                        />
                        <br></br>
                        <p>N:</p>
                        <input
                          type='text'
                          onChange={(e) => setN(e.target.value)}
                        />
                      </form> : <></>
                      }
                    </div>
                    <br></br>
                  </Card.Header>
                  <Card.Footer>
                    <hr></hr>
                    <div className="stats">
                      {generateCodeToggle ? <button onClick={() => {
                        setgenerateCodeToggle(!generateCodeToggle);
                      }}>Generate</button> : <button onClick={() => {
                        setgenerateCodeToggle(!generateCodeToggle);
                      }}>Expand</button>
                      }

                    </div>
                  </Card.Footer>

                </Card>
              </Col>
              <Col lg="4" sm="6">
                <Card className="card-stats">
                  <Card.Header>
                    <Card.Title as="h4">Share Missile Codes</Card.Title>
                    <p className="card-category">Share missile codes among authenticated users</p>
                    <br></br>
                  </Card.Header>
                  <Card.Footer>
                    <hr></hr>
                    <div className="stats">
                      <button onClick={() => {
                        axios
                          .post(shareMissileCodeFromServerURL)
                          .then((response) => {
                            console.log("result from shareMissileCode", response);
                          })
                          .catch((error) => {
                            console.log(error);
                          });
                      }}>Share Secret Shares</button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
              <Col lg="4" sm="6">
                <Card className="card-stats">
                  <Card.Header>
                    <Card.Title as="h4">Recontruct Secret</Card.Title>
                    <p className="card-category">Reconstruct secret using shares from T authenticated users</p>
                    <br></br>
                  </Card.Header>
                  <Card.Footer>
                    <hr></hr>
                    <div className="stats">
                      <button onClick={() => {
                        axios
                          .post(recreateSecretFromServerURL)
                          .then((response) => {
                            console.log("result from recreateSecret", response);
                          })
                          .catch((error) => {
                            console.log(error);
                          });
                      }}>Recontruct Secret</button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            </Row>
          </Col>
          <Col md="3">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Authenticated Users</Card.Title>
                <p className="card-category">All authenticated users in the system</p>
              </Card.Header>
              <Card.Body>
                <div>
                  <ul>
                    {authenticatedUsers.map(user => {
                      return (
                        <li>
                          <div className="card-container">
                            <p>
                              <strong>{user.userName}</strong>
                            </p>
                            <p>{user.userRole}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                <div className="stats">
                  <button onClick={clearAuthenticatedUsers}>Clear Authenticated Users</button>
                </div>
              </Card.Footer>
            </Card>
          </Col>


        </Row >

      </Container >
    </>
  );
}

export default Dashboard;
