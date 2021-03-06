import React, { Component } from "react";
import _ from "lodash";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "./navbar/navbar";
import auth from "../../services/authService";
import { getComplaints } from "../../services/complaintService";
import Pagination from "../common/pagination";
import { paginate } from "../../utils/paginate";
import ListGroup from "../common/listGroup";
import { getCategories } from "../../services/categoryService";
import CompalinerTable from "./complainerTable/complainerTable";
import SearchBox from "./searchBox";
import Showcase from "./showcase";

class Complainer extends Component {
  state = {
    complaints: [],
    categories: [],
    assignees: [],
    pageSize: 9,
    currentPage: 1,
    sortColumn: { path: "title", order: "asc" },
    searchQuery: "",
    selectedCategory: null
  };

  async componentDidMount() {
    try {
      const user = auth.getCurrentUser();
      this.setState({ user });

      if (!user || user.role !== "complainer") {
        toast.error("Access denied to this Route!");
        this.props.history.replace("/");
      }
    } catch (ex) {
      window.location = "/login";
    }

    this.getAllComplaints();

    // const socket = openSocket("http://localhost:5000");
    // socket.on("complaints", data => {
    //   if (data.action === "changed status") {
    //     toast.info(
    //       `Complaints: "${data.complaint}'s" status is changed to "${
    //         data.status
    //       }"`
    //     );
    //     this.getAllComplaints();
    //   }
    // });

    const { data: allcategories } = await getCategories();
    const categories = [{ _id: "", name: "All Categories" }, ...allcategories];

    this.setState({ categories });
  }

  // getting all complaints
  getAllComplaints = async () => {
    const { data: complaints } = await getComplaints();
    this.setState({ complaints });

    let arr = [];

    for (let i = 0; i < complaints.length; i++) {
      if (complaints[i].assignedTo) {
        console.log(complaints[i].assignedTo);
        arr.push(complaints[i].assignedTo);
      }
    }

    const uniqueAssignees = _.uniqBy(arr, function(o) {
      return o._id;
    });

    console.log(uniqueAssignees);
    this.setState(prevState => {
      return {
        assignees: uniqueAssignees
      };
    });
  };

  // handle detail
  handleDetail = complaint => {
    // console.log(complaint);
    this.props.history.replace(`/complainer/${complaint._id}`);
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
      assignees
    } = this.state;
    // const { length: count } = this.state.complaints;
    const { length: count } = this.state.complaints;

    if (count === 0) {
      return (
        <>
          <Navbar user={this.state.user} assignees={assignees} />

          <div className="container">
            <Link
              to="/complainer/new-complaint"
              className="btn btn-primary mb-2"
            >
              New Complaint &rarr;
            </Link>
            <h4>There are no complaints in the database</h4>
          </div>
        </>
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
        <Navbar user={this.state.user} assignees={assignees} />

        <div className="container">
          {this.state.user && <h3>Hello {this.state.user.name} !</h3>}
          <hr />
          <Showcase
            resolved={resolved}
            inprogress={inprogress}
            closed={closed}
          />
          {count !== 0 && (
            <div className="row">
              <div className="col-md-2">
                <ListGroup
                  items={this.state.categories}
                  selectedItem={this.state.selectedCategory}
                  onItemSelect={this.handleCategorySelect}
                />
              </div>
              <div className="col-md-10">
                <Link
                  to="/complainer/new-complaint"
                  className="btn btn-primary mb-2"
                >
                  New Complaint &rarr;
                </Link>

                <p>Showing {filtered.length} complaints</p>

                <SearchBox value={searchQuery} onChange={this.handleSearch} />

                <CompalinerTable
                  complaints={complaints}
                  sortColumn={sortColumn}
                  onSort={this.handleSort}
                  onDetail={this.handleDetail}
                />
                <Pagination
                  itemsCount={filtered.length}
                  pageSize={pageSize}
                  currentPage={currentPage}
                  onPageChange={this.handlePageChange}
                />
              </div>
            </div>
          )}
        </div>
      </React.Fragment>
    );
  }
}

export default Complainer;
