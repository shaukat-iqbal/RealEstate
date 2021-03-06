import React from "react";
import { Route, Link } from "react-router-dom";
import PropTypes from "prop-types";
import AppBar from "@material-ui/core/AppBar";
import CssBaseline from "@material-ui/core/CssBaseline";
import Divider from "@material-ui/core/Divider";
import Drawer from "@material-ui/core/Drawer";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import MenuIcon from "@material-ui/icons/Menu";
import Icon from "@material-ui/core/Icon";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import RegisterForm from "../Register";
import Users from "../users";
import FileUpload from "../fileUpload";

import { getCurrentUser } from "../../../../services/authService";
import UserLogo from "../../../common/logo";
const drawerWidth = 240;

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex"
  },
  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: drawerWidth,
      flexShrink: 0
    }
  },
  appBar: {
    marginLeft: drawerWidth,
    [theme.breakpoints.up("sm")]: {
      width: `calc(100% - ${drawerWidth}px)`
    }
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      display: "none"
    }
  },
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth
  },
  content: {
    minHeight: "700px",
    backgroundColor: "#f8f8f8",
    flexGrow: 1,
    padding: theme.spacing(0)
  }
}));

function UserManagement(props) {
  const { container } = props;
  const classes = useStyles();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  function handleDrawerToggle() {
    setMobileOpen(!mobileOpen);
  }

  const drawer = (
    <div>
      <div className={classes.toolbar}>
        <div
          className="d-flex flex-column align-items-center p-3"
          style={{
            backgroundImage:
              "url(" +
              require("./../../../../resources/img/drawerProfileBackground.png") +
              ")",
            height: "150px",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover"
          }}
        >
          <UserLogo width="70px" height="70px" />
          <div className="text-white m-0 d-inline">
            <span
              className="d-inline"
              style={{ color: "orange", marginRight: "2px" }}
            >
              <i className="fa fa-circle " />
            </span>
            <p className="d-inline">Online</p>
          </div>
          <p className="text-white m-0">{getCurrentUser().name}</p>
        </div>
      </div>
      <Divider />

      <List>
        {[
          {
            label: "Create Account",
            path: "/admin/users/register",
            icon: "add_circle"
          },
          {
            label: "Assignees",
            path: "/admin/users/assignees",
            icon: "person"
          },
          {
            label: "Complainers",
            path: "/admin/users/complainers",
            icon: "person"
          }
        ].map(item => (
          <Link
            key={item.label}
            className="nav-item nav-link text-dark p-0"
            to={item.path || "/admin"}
            style={{ textDecoration: "none" }}
          >
            <ListItem button key={item.label}>
              <Icon
                style={{ marginRight: "9px" }}
                color="primary"
                fontSize="large"
              >
                {item.icon || "person"}
              </Icon>
              <ListItemText primary={item.label} />
            </ListItem>
          </Link>
        ))}
      </List>

      <Divider />
      <List>
        {[
          {
            label: "Home",
            path: "/admin/",
            icon: "home"
          },
          {
            label: "Configuration",
            path: "/admin/configuration",
            icon: "person"
          },
          {
            label: "Complainers",
            path: "/admin/users/complainers",
            icon: "person"
          }
        ].map(item => (
          <Link
            key={item.label}
            className="nav-item nav-link text-dark p-0"
            to={item.path || "/admin"}
            style={{ textDecoration: "none" }}
          >
            <ListItem button key={item.label}>
              <Icon
                style={{ marginRight: "9px" }}
                color="primary"
                fontSize="large"
              >
                {item.icon || "person"}
              </Icon>
              <ListItemText primary={item.label} />
            </ListItem>
          </Link>
        ))}
      </List>
    </div>
  );

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar className="d-flex justify-content-between">
          <div>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              className={classes.menuButton}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              Users Management
            </Typography>
          </div>
          <div>
            {/* write code to get profile pic of admin */}
            <UserLogo />
          </div>
        </Toolbar>
      </AppBar>
      <nav className={classes.drawer} aria-label="mailbox folders">
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Hidden smUp implementation="css">
          <Drawer
            container={container}
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper
            }}
            ModalProps={{
              keepMounted: true // Better open performance on mobile.
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden xsDown implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper
            }}
            variant="permanent"
            open
          >
            {drawer}
          </Drawer>
        </Hidden>
      </nav>
      <main className={`${classes.content} container-fluid `}>
        <div className="d-flex justify-content-around flex-wrap">
          <Route path="/admin/users/register" exact component={RegisterForm} />
          <Route path="/admin/users/register" exact component={FileUpload} />
        </div>
        <div className="d-flex justify-content-around">
          <Route
            path="/admin/users/edit/:id/:role"
            render={props => <RegisterForm isEditView={true} {...props} />}
          />
        </div>

        {/* <Route
          path="/user/profile/:id/:role"
          render={props => <RegisterForm isProfile={true} />}
        /> */}

        <Route
          path="/admin/users/assignees"
          render={props => <Users role="assignees" {...props} />}
        />
        <Route
          path="/admin/users/complainers"
          render={props => <Users role="complainers" {...props} />}
        />
      </main>
    </div>
  );
}

UserManagement.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  container: PropTypes.object
};

export default UserManagement;
