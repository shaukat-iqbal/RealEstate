import React, { Component } from "react";
import { Link } from "react-router-dom";
import Table from "../../common/table";
import auth from "../../../services/authService";
class UsersTable extends Component {
  columns = [
    { path: "name", label: "Name" },
    { path: "email", label: "Email" },
    { path: "phone", label: "Phone" }
  ];

  deleteColumn = {
    key: "delete",
    content: user => (
      <button
        onClick={() => this.props.onDelete(user)}
        className="btn btn-danger btn-sm"
      >
        Delete
      </button>
    )
  };

  viewDetails = {
    key: "viewDetails",
    content: user => (
      <Link
        to={`/profile/${user._id}/${this.props.role}`}
        className="btn btn-danger btn-sm"
      >
        View Profile
      </Link>
    )
  };

  editColumn = {
    key: "edit",
    content: user => (
      <button
        onClick={() => this.props.onEdit(user)}
        className="btn btn-danger btn-sm"
      >
        Edit
      </button>
    )
  };

  constructor() {
    super();
    const user = auth.getCurrentUser();
    if (user && user.role === "admin") {
      this.columns.push(this.editColumn);
      this.columns.push(this.viewDetails);
      this.columns.push(this.deleteColumn);
    }
  }

  //
  render() {
    return (
      <Table
        columns={this.columns}
        data={this.props.users}
        sortColumn={this.props.sortColumn}
        onSort={this.props.onSort}
      />
    );
  }
}

export default UsersTable;
