import React from 'react'
import {makeStyles, createMuiTheme } from '@material-ui/core/styles';
import {Card, Box, CardActionArea, CardMedia, CardHeader, ThemeProvider} from '@material-ui/core';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { useHistory, withRouter } from 'react-router-dom'


const theme = createMuiTheme({
  typography: {
    h6: {
      //width: "400px",
      textAlign:"justify",
      whiteSpace:"nowrap",
      overflow:"hidden",
      overflowWrap: "break-word",
      textOverflow:"ellipsis",
     },
    subtitle2:{
      width:"100%",
      textAlign:"justify",
      display: "box",
      boxOrient: "vertical",
      lineClamp:5,
      overflow:"hidden",
      overflowWrap: "break-word",
      textOverflow:"ellipsis",
    }
    },
});



const useStyles = makeStyles((theme) => ({
  topdiv:{
    maxWidth: "400px",
    //minWidth: "400px",
    minHeight:"450px",
    maxHeight:"450px",
    display: "flex",
    margin:10,
    overflow:"hidden",
    boxShadow: "0px 0px 10px 2px #9B9B9B",
  },
  header:{
	  display: "block",
    width:"100%",
    minHeight:"12%",
    maxHeight:"12%",
    justifyItems:"center",
    justifyContent:"center",
  },
  abstract:{
    minHeight:"88%",
    maxHeight:"88%",
    textAlign:"justify",
  },
	card: {
    variant: 'outlined',
    elevation: 24,
    minWidth: "100%",
    minHeight:"100%",
	},
  CardActionArea: {
    minHeight:"415px",
    maxHeight:"415px",
  },
	media: {
    maxHeight:"225px",
    minHeight:"225px",
    Width:"100%",
	  display: "flex",
	  justifyContent: "flex-start",
	},
  cardtext:{
    justifyContent:"center",
    minHeight:"190px",
    maxHeight:"190px",
    overflowWrap: "break-word",
    overflow:"hidden",
  },
	cardActions: {
	  display: "flex",
	  justifyContent: "center",
    minHeight:"35px",
    maxHeight:"35px",
    padding:0,
	},
	author: {
	  display: "flex",
    alignItems:"center",
	},
  }));



const Cards = (props) => {
    const classes = useStyles();
    const history = useHistory();
    
    function pushContent() {
      history.push("/content/"+props.contentid);
    }
    return(

        <div className={classes.topdiv}>
            <Card className={classes.card} elevation={24}>
							<CardActionArea className={classes.CardActionArea} onClick={pushContent}>
                <CardMedia 
                    className={classes.media}
                    image={props.pictures} 
                />
                <div className={classes.cardtext}>
                  <div className={classes.header}>
                    <ThemeProvider theme={theme}>
                      <CardHeader
                      title={props.headers}
                      titleTypographyProps={{
                        variant:'h6',
                      }}
                      />
                    </ThemeProvider>
                  </div>
                  <div className={classes.abstract}>
                    <CardContent>
                      <ThemeProvider theme={theme}>
                          <Typography variant="subtitle2">
                            {props.abstracts}
                          </Typography>
                      </ThemeProvider>
                    </CardContent>
                  </div>
                </div>
							</CardActionArea>
							<CardActions className={classes.cardActions}>
								<Box className={classes.author}>
                     <Typography variant="subtitle2" color="textSecondary" component="p">
                      Von: {props.authors}  am: {props.dates}
                    </Typography>
								</Box>
							</CardActions>
            </Card>
        </div>
  );



}

export default withRouter(Cards);