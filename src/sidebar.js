import React, { useState, useEffect } from "react";
import {
  Drawer as MUIDrawer,
  ListItem,
  List,
  ListItemIcon,
  ListItemText,
  Divider
} from "@material-ui/core";
import { faHome, faImages, faSignInAlt, faBeer, faTimes} from '@fortawesome/free-solid-svg-icons'
import { makeStyles } from "@material-ui/core/styles";
import { withRouter } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const useStyles = makeStyles({
  drawer: {
    minWidth: '240px',
  },
  bottomPush: {
    position: "fixed",
    bottom: 0,
  },
  listitem:{
    justifyContent:'space-between',
    marginTop:'5px'
  },
  icon: {
    justifyContent:'center',
    color: 'black'
  }
});

const Sidebar = props => {
  const { history } = props;
  const [selected, setSelected] = useState();
  const classes = useStyles();
  const itemsList = [
    {
      text: "Home",
      icon: <FontAwesomeIcon icon={faHome} size="2x"/>,
      location: '/',
    },
    {
      text: "Bilder",
      icon: <FontAwesomeIcon icon={faImages} size="2x" />,
      location: '/bilder',
    },
    {
      text: "Trinkspiel",
      icon: <FontAwesomeIcon icon={faBeer} size="2x"/>,
      location: '/drinking',
    }
  ];

  useEffect(() => {
    //sets the selected to the correct location pathname
    switch(true){
      case(history.location.pathname.match(/bilder/gi)?.length>0):
        setSelected("Bilder")
        break;
      case(history.location.pathname.match(/drinking/gi)?.length>0):
        setSelected("Trinkspiel")
        break;
      case(history.location.pathname.match(/admin/gi)?.length>0):
        setSelected("Adminbereich")
        break;
      default:
        setSelected("Home")
        
    }
    //eslint-disable-next-line
  },[])

  const onSelect = (location, key) =>{
    history.push(location);
    setSelected(key);
    props.toggleNav();
  }

  return (
    <MUIDrawer variant="temporary" className={classes.drawer} open={props.expanded} onClose={props.toggleNav}>
      <List clasName={classes.drawer}>
        <ListItem button key={'close'} onClick={props.toggleNav} className={classes.listitem}>
          <ListItemIcon className={classes.icon}>
            <FontAwesomeIcon icon={faTimes} size="2x"/>
          </ListItemIcon>
        </ListItem>
      </List>
        <Divider/>
      <List className={classes.drawer}>
        {itemsList.map((item, index) => {
          const { text, icon, location} = item;
          return (
            <ListItem button key={text} onClick={() => onSelect(location,text)} className={classes.listitem} selected={selected===text}>
              {icon && <ListItemIcon className={classes.icon}>{icon}</ListItemIcon>}
              <ListItemText primary={text} />
            </ListItem>
          );
        })}
      </List>
      <Divider/>
      <div className={classes.bottomPush}>
        <List className={classes.drawer}>
          <ListItem button key={'Adminbereich'} onClick={() => onSelect('/admin','Adminbereich')} className={classes.listitem} selected={selected==='Adminbereich'}>
              <ListItemIcon className={classes.icon}>
                <FontAwesomeIcon icon={faSignInAlt} size="2x"/>
              </ListItemIcon>
              <ListItemText primary={'Upload'} />
            </ListItem>
        </List>
      </div>
    </MUIDrawer>
  );
};

export default withRouter(Sidebar)