import React from "react";
import _ from "lodash";
import { toast } from "react-toastify";
import { Route, Switch, Redirect } from "react-router-dom";

import auth from "../../services/authService";
import AssigneeDashboard from "./dashboard/AssigneeDashboard";
import AdminComplaintDetail from "./AssigneeComplaintDetail";
import NavbarAssignee from "./navbar/navbarAssignee";
import { getAssigneeComplaints } from "../../services/complaintService";

class Assignee extends React.Component {
  state = {
    complainers: [],
    user: "",
    complaints: []
  };

  async componentDidMount() {
    const user = auth.getCurrentUser();
    // setUser(user);
    this.setState({ user: user });

    if (!user || user.role !== "assignee") {
      toast.error("Access denied to this route!");
      this.props
        ? this.props.history.replace("/login")
        : window.location("/login");
    }
    const { data } = await getAssigneeComplaints();

    this.setState(pre => {
      return {
        complaints: data
      };
    });

    setTimeout(() => {
      console.log(this.state.complaints);
    }, 4000);

    let arr = [];

    for (let i = 0; i < data.length; i++) {
      if (data[i].complainer) {
        console.log(data[i].complainer);
        arr.push(data[i].complainer);
      }
    }

    const uniquecomplainer = _.uniqBy(arr, function(o) {
      return o._id;
    });

    this.setState(prevState => {
      return {
        complainers: uniquecomplainer
      };
    });
  }

  render() {
    return (
      <React.Fragment>
        <NavbarAssignee
          user={this.state.user}
          complainers={this.state.complainers}
        />
        <div>
          <Switch>
            <Route
              path="/assignee/dashboard"
              render={props => (
                <AssigneeDashboard
                  {...props}
                  complaints={this.state.complaints}
                />
              )}
            />
            <Route
              exact
              path="/assignee/:id"
              component={AdminComplaintDetail}
            />
            <Redirect exact from="/assignee" to="/assignee/dashboard" />
          </Switch>
        </div>
      </React.Fragment>
    );
  }
}

export default Assignee;
