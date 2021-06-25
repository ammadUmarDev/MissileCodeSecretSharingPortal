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
  const getAuthenticatedUsersFromServerURL = "http://192.168.43.231:9080/api/getAuthenticatedUsers";
  const clearAuthenticatedUsersFromServerURL = "http://192.168.43.231:9080/api/clearAuthenticatedUsers";
  const createUserFromServerURL = "http://192.168.43.231:9080/api/createUser";
  const authenticateUserFromServerURL = "http://192.168.43.231:9080/api/authenticateUser";
  const shareMissileCodeFromServerURL = "http://192.168.43.231:9080/api/shareMissileCode";
  const recreateSecretFromServerURL = "http://192.168.43.231:9080/api/recreateSecret";
  const generateMissileCodesFromServerURL = "http://192.168.43.231:9080/api/generateMissileCodes";
  const [authenticatedUsers, setAuthenticatedUsers] = useState([]);
  const [authenticatedUsersUpdated, setauthenticatedUsersUpdated] = useState(true);
  const [authenticateCreateToggle, setauthenticateCreateToggle] = useState(true);
  const [reconstructToggle, setreconstructToggle] = useState(true);
  const [generateCodeToggle, setgenerateCodeToggle] = useState(false);
  const [userName, setuserName] = useState("");
  const [password, setpassword] = useState("");
  const [Tvalue, setTvalue] = useState("");
  const [Nvalue, setNvalue] = useState("");
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
                            .get(createUserFromServerURL)
                            .then((response) => {
                              console.log("result from createUser", response);
                              alert(response.data);
                            })
                            .catch((error) => {
                              console.log(error);
                              alert(error)
                            });

                        }}>Create</button>
                        <span> </span>
                        <button onClick={() => {
                          setauthenticateCreateToggle(!authenticateCreateToggle);

                        }}>Authenticate</button>
                      </div> : <><button onClick={() => {
                        setauthenticateCreateToggle(!authenticateCreateToggle);
                        const params = new URLSearchParams([['username', userName], ['paassword', password]]);
                        axios
                          .get(authenticateUserFromServerURL, { params })
                          .then((response) => {
                            console.log("result from authenticateUsers", response.data);
                            alert("Generated secret using N & T: " + response.data.Secret);
                          })
                          .catch((error) => {
                            console.log(error);
                          });
                      }}>Authenticate</button>
                        <span> </span>
                        <button onClick={() => {
                          axios
                            .get(createUserFromServerURL)
                            .then((response) => {
                              console.log("result from createUser", response);

                              alert(response.data);
                            })
                            .catch((error) => {
                              console.log(error);
                              alert(error)
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
                          onChange={(e) => setTvalue(e.target.value)}
                        />
                        <br></br>
                        <p>N:</p>
                        <input
                          type='text'
                          onChange={(e) => setNvalue(e.target.value)}
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
                        const params = new URLSearchParams([['T', Tvalue], ['N', Nvalue]]);
                        axios
                          .get(generateMissileCodesFromServerURL, { params })
                          .then((response) => {
                            console.log("result from shareMissileCode", response.data);
                            alert("Generated secret using N & T: " + response.data.Secret);
                          })
                          .catch((error) => {
                            console.log(error);
                          });
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
                          .get(shareMissileCodeFromServerURL)
                          .then((response) => {
                            console.log("result from shareMissileCode", response);
                            alert(response.data.Status);
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
                        setreconstructToggle(!reconstructToggle);
                        axios
                          .get(recreateSecretFromServerURL)
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
                  <button onClick={() => {
                    axios
                      .get(clearAuthenticatedUsersFromServerURL)
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
                  }}>Clear Authenticated Users</button>
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
