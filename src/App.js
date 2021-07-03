import './App.css';
import React, { useState, useEffect } from 'react';
import Uploadblog from './uploadblog.js';
import Content from './content.js';
import GetBilder from './bilder/bilder.js';
import Trinkspiel from './trinkspiel.js';
import Downloadblog from './downloadblog.js';
import NoContent from './nocontent.js';
import ProtectedRoute from './ProtectedRoute';
import Sidebar from './sidebar.js';
import { makeStyles } from '@material-ui/core/styles';
import { HashRouter as Router, Switch, Route, withRouter } from 'react-router-dom';
import axios from 'axios';
import { IconButton } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

const validatejwtpath = 'https://juliusannafelix.ddns.net/validatejwt.php';
const loginpath = 'https://juliusannafelix.ddns.net/login.php';

const useStyles = makeStyles({
	sidenavButton: {
		color: 'black',
		position: 'fixed',
		zIndex: '150',
	},
});

function App() {
	const [loggedin, setLogin] = useState(false);
	const [username, setUsername] = useState('');
	const [navexpanded, setNav] = useState(false);
	const [loginerror, setLoginerror] = useState('');
	const classes = useStyles();

	const handleLogin = (username, password) => {
		var data = new FormData();
		data.append('name', username);
		data.append('pw', password);
		axios({
			method: 'POST',
			url: `${loginpath}`,
			headers: { 'content-type': 'multipart/form-data' },
			data: data,
		})
			.then((response) => {
				if (response.data.length >= 200) {
					Login();
					handleUsername(username);
					localStorage.setItem('jwt', response.data);
				} else {
					setLoginerror('Username und/oder Passwort ist falsch.');
				}
			})
			.catch((error) => alert(`${error}`));
	};

	const Login = () => {
		setLoginerror('');
		setLogin(true);
	};

	const handleLogout = (e) => {
		e.preventDefault();
		setLogin(false);
		setUsername('');
	};

	const handleUsername = (username) => {
		setUsername(username);
	};

	const toggleNav = () => {
		const invertedstate = !navexpanded;
		setNav(invertedstate);
	};

	document.onscroll = headerscroll;

	useEffect(() => {
		if (!loggedin || username.length === 0) {
			const jwt = localStorage.getItem('jwt');
			if (!jwt) {
				return;
			}
			var data = new FormData();
			data.append('jwt', jwt);
			axios({
				method: 'POST',
				url: `${validatejwtpath}`,
				headers: { 'content-type': 'multipart/form-data' },
				data: data,
			})
				.then((response) => {
					if (typeof response.data === 'object') {
						Login();
						handleUsername(response.data[1]);
					}
				})
				.catch((error) => alert(`Error: ${error}`));
		}
		return () => {
			axios.Cancel();
		};
	});

	const sidenavButton = () => {
		if (navexpanded) {
			return;
		}
		return (
			<IconButton onClick={() => toggleNav()} className={classes.sidenavButton}>
				<FontAwesomeIcon icon={faBars} size='lg' />
			</IconButton>
		);
	};

	return (
		<>
			<div id='App'>
				{sidenavButton()}
				<Router>
					<Sidebar expanded={navexpanded} toggleNav={toggleNav} />
					<div id='Main'>
						<div id='top-container'>
							<h1>
								<br />
								<br />
							</h1>
							<div className='headerwrapper'>
								<header className='App-header' id='App-header'>
									<h1>Julius Anna Felix</h1>
								</header>
							</div>
						</div>
						<div id='Content'>
							<Switch>
								<Route
									path='/home/cardnumber/:cardnumber/pagenumber/:pagenumber'
									component={withRouter((props) => (
										<Downloadblog />
									))}
								/>
								<Route
									path='/home/cardnumber/:cardnumber'
									component={withRouter((props) => (
										<Downloadblog />
									))}
								/>
								<Route
									path='/home/pagenumber/:pagenumber'
									component={withRouter((props) => (
										<Downloadblog />
									))}
								/>
								<Route
									path='/'
									exact
									component={withRouter((props) => (
										<Downloadblog />
									))}
								/>
								<Route
									path='/home'
									component={withRouter((props) => (
										<Downloadblog />
									))}
								/>
								<ProtectedRoute
									path='/admin'
									loggedin={loggedin}
									handleLogin={handleLogin}
									handleLogout={handleLogout}
									loginerror={loginerror}
									exact
									component={(props) => <Uploadblog username={username} />}
								/>
								<Route
									path='/content/:contentid'
									component={withRouter((props) => (
										<Content user={username} />
									))}
								/>
								<Route path='/bilder' component={(props) => <GetBilder />} />
								<Route
									path='/drinking'
									component={(props) => <Trinkspiel navexpanded={navexpanded} />}
								/>
								<Route
									path='/'
									component={withRouter((props) => (
										<NoContent />
									))}
								/>
							</Switch>
						</div>
					</div>
				</Router>
			</div>
		</>
	);
}

function headerscroll() {
	if (document.readyState === 'complete' || document.readyState === 'loaded') {
		var header = document.getElementById('App-header');
		if (window.pageYOffset >= 100) {
			header.classList.add('stickynav');
		} else {
			header.classList.remove('stickynav');
		}
	}
}

export default App;
