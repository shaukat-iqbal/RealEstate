import React, { Component } from "react";
import _ from "lodash";
import openSocket from "socket.io-client";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";

// import config from "../../../config.json";
import SearchBox from "../../complainer/searchBox";
import Showcase from "../../complainer/showcase";
import AssigneeTable from "../AssigneeTable";
import Pagination from "../../common/pagination";
import ListGroup from "../../common/listGroup";

import {
  markSpam,
  getAssigneeComplaints,
  dropResponsibility
} from "../../../services/complaintService";
import { paginate } from "../../../utils/paginate";
import { toast } from "react-toastify";
import { getAssigneeCategories } from "../../../services/categoryService";
import SpamList from "../spamlist";

class AssigneeDashboard extends Component {
  state = {
    complaints: [],
    spamComplaints: [],
    displaySpamList: false,
    categories: [],
    pageSize: 9,
    currentPage: 1,
    sortColumn: { path: "title", order: "asc" },
    searchQuery: "",
    selectedCategory: null,
    checkedComplaint: null,
    defaultChecked: false,
    confirmSpam: false,
    confirmDrop: false
  };

  async componentDidMount() {
    this.getComplaints();
    this.checkSocketConnection();
    this.getAllCategories();
  }

  //getting categories
  getAllCategories = async () => {
    const { data: allcategories } = await getAssigneeCategories();
    const categories = [{ _id: "", name: "All Categories" }, ...allcategories];
    this.setState({ categories });
  };

  // check socketio
  checkSocketConnection = () => {
    const socket = openSocket("http://localhost:5000", { reconnection: true });
    socket.once("complaints", data => {
      if (data.action === "new complaint") {
        this.createNewComplaint(data.complaint);
        toast.info(
          `New Complaint has been registered with title "${
            data.complaint.title
          }"`
        );
      } else if (data.action === "task assigned") {
        this.createNewComplaint(data.complaint);
        toast.info(
          `New Complaint has been assigned to you with title "${
            data.complaint.title
          }"`
        );
      } else if (data.action === "feedback") {
        this.createNewComplaintAfterDropping(data.complaint);
        toast.info(
          `Complainer has given you feedback on Complaint with title "${
            data.complaint.title
          }"`
        );
      }
    });
  };

  // handling after dropping complaint from assignee
  createNewComplaintAfterDropping = complaint => {
    this.setState(prevState => {
      const updatedComplaints = [...prevState.complaints];

      for (let i = 0; i < updatedComplaints.length; i++) {
        if (updatedComplaints[i]._id === complaint._id) {
          updatedComplaints.splice(i, 1, complaint);
          // updatedComplaints.unshift(complaint);
          break;
        }
      }
      return { complaints: updatedComplaints };
    });
  };

  // create new complaint that is created now
  createNewComplaint = complaint => {
    this.setState(prevState => {
      const updatedComplaints = [...prevState.complaints];
      updatedComplaints.unshift(complaint);
      return { complaints: updatedComplaints };
    });
  };

  // getting all complaints
  getComplaints = async () => {
    const { data: complaints } = await getAssigneeComplaints();
    this.setState({ complaints });
  };

  getSpamList = async () => {
    console.log(this.state.displaySpamList);
    this.setState({ displaySpamList: true });
  };

  // handleCheckSpamDisplay
  handleCheckSpamDisplay = display => {
    this.setState({ displaySpamList: display });
    this.getComplaints();
  };

  // handle detail
  handleDetail = complaint => {
    // console.log(complaint);
    this.props.history.replace(`/assignee/${complaint._id}`);
  };

  // handle pagination
  handlePageChange = page => {
    this.setState({ currentPage: page });
  };

  // handle Category Select
  handleCategorySelect = category => {
    this.setState({
      selectedCategory: category,
      searchQuery: "",
      currentPage: 1
    });
  };

  // handle Sort
  handleSort = sortColumn => {
    this.setState({ sortColumn });
  };

  // handle Search
  handleSearch = query => {
    this.setState({
      searchQuery: query,
      selectedCategory: null,
      currentPage: 1
    });
  };

  // handle CheckBoxChecked
  handleCheckBoxChecked = complaint => {
    this.setState({ checkedComplaint: complaint });
  };

  // drop confirmation

  handleDropConfirmation = complaint => {
    this.handleDropResponsibility(complaint);
    this.setState({ confirmDrop: false });
    this.setState({ checkedComplaint: "" });
  };

  // handle drop responsibility
  handleDropResponsibility = async complaint => {
    console.log(complaint.title);
    await dropResponsibility(complaint._id);

    toast.success("You have successfully dropped Responsibility");

    const { data: complaints } = await getAssigneeComplaints();
    this.setState({ complaints });

    setTimeout(() => {
      toast.success("Complaint is assigned to ADMIN for Further Assignment");
    }, 900);
  };

  // handle spam
  handleSpamConfirmation = complaint => {
    this.handleSpam(complaint);
    this.setState({ confirmSpam: false });
  };

  // handle mark as spam
  handleSpam = async complaint => {
    await markSpam(complaint._id, true);
    this.setState({ checkedComplaint: null });
    // this.props.history.replace("/assignee");
    toast.success("You have successfully Marked this as spam");

    const { data: complaints } = await getAssigneeComplaints();
    this.setState({ complaints });
    this.setState({ displaySpamList: false });
  };

  // handle close alert
  handleCloseAlert = () => {
    this.setState({ checkedComplaint: null });
  };

  // render
  render() {
    // get paged data
    const {
      complaints: allComplaints,
      pageSize,
      sortColumn,
      currentPage,
      selectedCategory,
      searchQuery,
      checkedComplaint,
      confirmSpam,
      confirmDrop,
      displaySpamList
    } = this.state;
    const { length: count } = allComplaints;

    if (count === 0) {
      return (
        <div className="container mt-3">
          <h4>There are no complaints in the database</h4>
          <button
            className="btn btn-outline-secondary btn-block mb-3"
            onClick={this.getSpamList}
          >
            Spam List
          </button>
        </div>
      );
    }

    let filtered = allComplaints;
    if (searchQuery) {
      filtered = allComplaints.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else if (selectedCategory && selectedCategory._id) {
      filtered = allComplaints.filter(
        c => c.category._id === selectedCategory._id
      );
    }

    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order]);

    const complaints = paginate(sorted, currentPage, pageSize);

    // complaints length for showing number
    const inprogress = allComplaints.filter(c => c.status === "in-progress")
      .length;
    const resolved = allComplaints.filter(
      c => c.status === "closed - relief granted"
    ).length;
    const closed = allComplaints.filter(
      c => c.status === "closed - relief can't be granted"
    ).length;

    // get paged data end
    return (
      <React.Fragment>
        <>
          {displaySpamList && (
            <SpamList
              displaySpamList={displaySpamList}
              checkDisplay={this.handleCheckSpamDisplay}
            />
          )}
          {confirmDrop && (
            <Dialog
              open={confirmDrop}
              onClose={() => {
                this.setState({ confirmDrop: false });
              }}
              aria-labelledby="form-dialog-title"
            >
              <DialogTitle id="form-dialog-title">
                Are you sure you want to drop responsibility?
              </DialogTitle>

              <DialogActions>
                <Button
                  onClick={() => {
                    this.setState({ confirmDrop: false });
                  }}
                  color="secondary"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => this.handleDropConfirmation(checkedComplaint)}
                  color="primary"
                >
                  Ok
                </Button>
              </DialogActions>
            </Dialog>
          )}
          {confirmSpam && (
            <Dialog
              open={confirmSpam}
              onClose={() => {
                this.setState({ confirmSpam: false });
              }}
              aria-labelledby="form-dialog-title"
            >
              <DialogTitle id="form-dialog-title">
                Are you sure you want to mark this complaint as spam?
              </DialogTitle>

              <DialogActions>
                <Button
                  onClick={() => {
                    this.setState({ confirmSpam: false });
                  }}
                  color="secondary"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => this.handleSpamConfirmation(checkedComplaint)}
                  color="primary"
                >
                  Ok
                </Button>
              </DialogActions>
            </Dialog>
          )}
          <Showcase
            resolved={resolved}
            inprogress={inprogress}
            closed={closed}
          />
          <div className="container">
            {checkedComplaint && (
              <div
                className="alert alert-info dismissible fade show"
                role="alert"
              >
                {/* <span className="d-flex justify-content-end"> */}
                <button
                  className="btn btn-info mr-3"
                  onClick={() => {
                    this.setState({ confirmSpam: true });
                  }}
                >
                  marks as spam
                </button>
                <button
                  className="btn btn-info"
                  onClick={() => {
                    this.setState({ confirmDrop: true });
                  }}
                >
                  drop from responsibility
                </button>
                {/* </span> */}
                <button
                  type="button"
                  className="close"
                  data-dismiss="alert"
                  aria-label="Close"
                  onClick={this.handleCloseAlert}
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
            )}

            {count !== 0 && (
              <>
                <div className="row">
                  <div className="col-md-2">
                    <button
                      className="btn btn-outline-secondary btn-block mb-3"
                      onClick={this.getSpamList}
                    >
                      Spam List
                    </button>
                    <ListGroup
                      items={this.state.categories}
                      selectedItem={this.state.selectedCategory}
                      onItemSelect={this.handleCategorySelect}
                    />
                  </div>
                  <div className="col-md-10">
                    <p>Showing {filtered.length} complaints</p>

                    <SearchBox
                      value={searchQuery}
                      onChange={this.handleSearch}
                    />

                    <AssigneeTable
                      complaints={complaints}
                      sortColumn={sortColumn}
                      onSort={this.handleSort}
                      onDetail={this.handleDetail}
                      onCheckBoxChecked={this.handleCheckBoxChecked}
                      // defaultChecked={defaultChecked}
                      checkedComplaint={checkedComplaint}
                    />
                    <Pagination
                      itemsCount={filtered.length}
                      pageSize={pageSize}
                      currentPage={currentPage}
                      onPageChange={this.handlePageChange}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      </React.Fragment>
    );
  }
}

export default AssigneeDashboard;
