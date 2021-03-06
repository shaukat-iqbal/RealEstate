/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { Link, NavLink } from "react-router-dom";
import auth, { getCurrentUser } from "../../../services/authService";

import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import { deleteConversation } from "../../../services/messageService";
import { toast } from "react-toastify";
import UserLogo from "../../common/logo";
import { setProfilePictureToken } from "../../../services/imageService";

const url = "/c/message";

class Navbar extends React.Component {
  state = {
    assignees: [],
    confirmation: false,
    assignee: "",
    src: "",
    profilePicture: false
  };

  async componentDidMount() {
    // const { data } = await getAllAssignees();
    // console.log(data);
    // this.setState(prevState => {
    //   return {
    //     assignees: data
    //   };
    // });
    if (!localStorage.getItem("profilePicture")) {
      await setProfilePictureToken(getCurrentUser()._id, "complainer");
      this.setState({ profilePicture: true });
    }
  }

  handleDelete = async assignee => {
    const data = {
      sender: auth.getCurrentUser()._id,
      receiver: assignee._id
    };
    await deleteConversation(data);
    this.setState({ confirmation: false });
    toast.success("Conversation is deleted");
  };

  displayConfirmation = as => {
    this.setState({ confirmation: true });
    this.setState({ assignee: as });
  };

  render() {
    const { user, assignees } = this.props;

    return (
      <>
        {this.state.confirmation && (
          <Dialog
            open={this.state.confirmation}
            onClose={() => {
              this.setState({ confirmation: false });
            }}
          >
            <DialogTitle>Alert</DialogTitle>
            <DialogContent>
              Are You sure you want to delete conversation with{" "}
              {this.state.assignee.name} ?
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  this.setState({ confirmation: false });
                }}
                color="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={() => this.handleDelete(this.state.assignee)}
                color="primary"
              >
                Ok
              </Button>
            </DialogActions>
          </Dialog>
        )}
        <nav
          className="navbar navbar-expand-sm navbar-light bg-light"
          id="main-nav"
        >
          <div className="container">
            <Link to="/complainer" className="navbar-brand text-dark">
              Quick Response
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              data-toggle="collapse"
              data-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon" />
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <div className="navbar-nav ml-auto ">
                <div className="dropdown">
                  <button
                    className="nav-button mt-2 mr-4"
                    type="button"
                    id="dropdownMenuButton"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    Messages
                  </button>
                  <div
                    className="dropdown-menu"
                    aria-labelledby="dropdownMenuButton"
                  >
                    {assignees.length > 0 ? (
                      <>
                        {assignees.map(as => (
                          <li
                            key={as._id}
                            className="dropdown-item d-flex justify-content-between align-items-center"
                          >
                            <Link
                              key={as._id}
                              to={`${url}/${as._id}`}
                              className="text-decoration-none text-dark"
                            >
                              {" "}
                              {as.name}{" "}
                            </Link>
                            <i
                              className="fa fa-trash pl-5 clickable"
                              onClick={() => this.displayConfirmation(as)}
                            />
                            <div className="dropdown-divider" />

                            {/* Confirmation */}

                            {/* Confirmation end */}
                          </li>
                        ))}
                      </>
                    ) : (
                      <>
                        <li className="dropdown-item">You have No messages</li>
                      </>
                    )}
                  </div>
                </div>

                <button className="nav-item dropdown nav-button">
                  <Link
                    className="nav-link dropdown-toggle"
                    to="#"
                    id="navbarDropdown"
                    role="button"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <UserLogo />
                    <span className="text-dark"> {user && user.name}</span>
                  </Link>
                  <div
                    className="dropdown-menu"
                    aria-labelledby="navbarDropdown"
                  >
                    <NavLink
                      className="dropdown-item"
                      to={`/profile/${getCurrentUser()._id}/complainers`}
                    >
                      Profile
                    </NavLink>
                    <NavLink className="dropdown-item" to={`/resetpassword`}>
                      Reset Password
                    </NavLink>

                    <NavLink className="dropdown-item" to="/logout">
                      Logout
                    </NavLink>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </nav>
      </>
    );
  }
}

export default Navbar;
