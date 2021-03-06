import React from "react";
import Joi from "joi-browser";

import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";

import Form from "../../common/form";
import Category from "../../common/category";
import {
  getCategories,
  getSentimentCategory
} from "../../../services/categoryService";
import { saveComplaint } from "../../../services/complaintService";
import { toast } from "react-toastify";
import Modal from "../../common/Modal/Modal";

class ComplaintForm extends Form {
  state = {
    data: {
      title: "",
      location: ""
    },
    categoryId: "",
    details: "",
    sentimentCategory: "",
    categoryError: "",
    errors: {},
    categories: [],
    isLoading: false,
    isDialogOpen: false,
    selectedFile: null,
    open: true
  };

  schema = {
    title: Joi.string()
      .required()
      .min(5)
      .max(1024)
      .label("Title"),

    location: Joi.string()
      .min(5)
      .max(255)
      .label("Location")
  };

  // componentDidMount
  async componentDidMount() {
    this.setState({ isLoading: true });
    await this.populateCategories();
    this.setState({ isLoading: false });
  }

  async populateCategories() {
    const { data: categories } = await getCategories();
    this.setState({ categories });
  }

  handleCategorySelect = categoryId => {
    this.setState({ categoryError: "" });
    this.setState({ categoryId: categoryId });
  };

  ToggleConfirmation = e => {
    e.preventDefault();

    if (!this.state.categoryId) {
      return this.setState({
        categoryError: "Category is not allowed to be empty"
      });
    }

    this.setState({ isLoading: false });
    this.setState({ isDialogOpen: true });
  };

  cancelDialog = () => {
    this.setState({ isDialogOpen: false });
  };

  handleFileChange = e => {
    // if (this.checkMimeType(e)) {
    this.setState({ selectedFile: e.target.files[0] });
  };

  doSubmit = async () => {
    this.setState({ isDialogOpen: false });
    this.setState({ isLoading: true });

    const data = new FormData();
    data.append("title", this.state.data.title);
    data.append("details", this.state.details);
    data.append("location", this.state.data.location);
    data.append("categoryId", this.state.categoryId);
    data.append("complaint", this.state.selectedFile);

    await saveComplaint(data);

    this.setState({ isLoading: false });
    toast.success("Complaint is successfully registered.");
    this.props.history.replace("/complainer");
  };

  // for file
  checkMimeType = event => {
    //getting file object
    let file = event.target.files[0];
    //define message container
    let err = "";
    // list allow mime type
    const types = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
    // loop access array
    if (types.every(type => file.type !== type)) {
      // create error message and assign to container
      err += file.type + " is not a supported format\n";
    }

    if (err !== "") {
      // if message not same old that mean has error
      event.target.value = null; // discard selected file
      console.log(err);
      // toast.error(err);
      return false;
    }
    return true;
  };

  handleClose = () => {
    this.setState({ open: false });
    this.props.history.replace("/complainer");
  };

  handleDetailsChange = ({ currentTarget: input }) => {
    this.setState(prevState => {
      return {
        details: input.value
      };
    });
  };

  handleDetailsBlur = async () => {
    const details = { details: this.state.details };
    const { data } = await getSentimentCategory(details);
    this.setState(prevState => {
      return {
        sentimentCategory: data
      };
    });
    console.log(this.state.sentimentCategory);
  };

  render() {
    return (
      <React.Fragment>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
          fullWidth={true}
        >
          <div className="container">
            <Modal show={this.state.isDialogOpen}>
              <p>You can't edit complaint after registering</p>

              <div className="float-right">
                <button className="btn btn-danger" onClick={this.cancelDialog}>
                  Cancel
                </button>
                <button
                  className="btn ml-3  btn-success"
                  onClick={this.handleSubmit}
                >
                  Ok
                </button>
              </div>
            </Modal>
            {this.state.isLoading && (
              <div className="d-flex justify-content-center">
                <div className="spinner-border" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              </div>
            )}

            {!this.state.isLoading && (
              <div>
                {/* <h3 className="pb-2">Please Fill this Form Carefully</h3> */}
                <DialogTitle id="form-dialog-title">
                  Please Fill this Form Carefully
                </DialogTitle>
                <hr />
                <DialogContent>
                  <form onSubmit={this.ToggleConfirmation}>
                    <div className="form-group">
                      <label htmlFor="details">Details</label>

                      <textarea
                        name="details"
                        id="details"
                        className="form-control"
                        value={this.state.details}
                        onChange={this.handleDetailsChange}
                        onBlur={this.handleDetailsBlur}
                        cols="70"
                        rows="4"
                      />
                    </div>
                    <p
                      className="text-muted text-sm-left"
                      style={{ fontSize: "10px" }}
                    >
                      Write your Complaint's detail elaborative because your
                      Complaint's "severity" will be automatically set based on
                      your Complaint's detail.
                      <br />
                      In order to get category automatically selected, You have
                      to leave "details" input after writing
                    </p>

                    {/* category  */}

                    {this.state.sentimentCategory && (
                      <>
                        <label>Category</label>
                        <Category
                          onCategoryId={this.handleCategorySelect}
                          category={this.state.sentimentCategory}
                        />
                      </>
                    )}
                    {/* category end  */}

                    {this.state.categoryError && (
                      <div className="alert alert-danger">
                        {this.state.categoryError}
                      </div>
                    )}
                    {/* {this.renderSelect(
                      "categoryId",
                      "Choose category",
                      this.state.categories
                    )} */}
                    {this.renderInput("title", "Title")}

                    {this.renderInput("location", "Enter Location")}

                    <div className="custom-file my-3">
                      <input
                        name="complaint"
                        id="complaint"
                        type="file"
                        className="custom-file-input"
                        onChange={this.handleFileChange}
                        ref={this.file}
                      />
                      <label className="custom-file-label" htmlFor="customFile">
                        Choose file
                      </label>
                    </div>
                    {this.state.selectedFile && (
                      <p>{this.state.selectedFile.name}</p>
                    )}
                    {/* <Map /> */}

                    {this.renderButton("Register")}
                  </form>
                </DialogContent>
              </div>
            )}
          </div>
        </Dialog>
      </React.Fragment>
    );
  }
}

export default ComplaintForm;
