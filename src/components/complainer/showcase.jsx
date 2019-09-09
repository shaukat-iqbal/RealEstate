import React from "react";
import CountUp from "react-countup";

const Showcase = ({ resolved, inprogress, closed }) => {
  return (
    <React.Fragment>
      <div className="">
        <div className="container h-100">
          <div className="row h-100 justify-content-center align-items-center">
            <div className="col-md-4 mb-4 ">
              <div
                className="card  mt-4 bg-primary text-white text-center"
                style={{ width: "18rem" }}
              >
                <div className="card-body">
                  <h3>
                    <i className="fa fa-spinner" />
                  </h3>
                  <h3>In Progress</h3>
                  <br />
                  <CountUp duration={3} end={inprogress} />
                  <br />
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-4 ">
              <div
                className="card mt-4 bg-success text-white text-center"
                style={{ width: "18rem" }}
              >
                <div className="card-body">
                  <h3>
                    <i className="fa fa-check" />
                  </h3>
                  <h3>Resolved</h3>
                  <br />

                  <CountUp duration={5} end={resolved} />

                  <br />
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-4 ">
              <div
                className="card mt-4 bg-info text-white text-center"
                style={{ width: "18rem" }}
              >
                <div className="card-body">
                  <h3>
                    <i className="fa fa-check" />
                  </h3>
                  <h3>Closed</h3>
                  <br />
                  <CountUp duration={5} end={closed} />
                  <br />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Showcase;
