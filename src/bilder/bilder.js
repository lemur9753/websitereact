import React from 'react';
import { Component } from 'react';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import './bilder.css';
import axios from 'axios';
import { Dialog } from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faTimes } from '@fortawesome/free-solid-svg-icons';

const bilderpath = 'https://juliusannafelix.ddns.net/getinsta.php';

class GetBilder extends Component {
	constructor(props) {
		super(props);
		this.state = {
			medias: [],
			error: '',
			modalopen: false,
			mediasrc: '',
			isvideo: false,
		};
	}

	componentDidMount() {
		if (localStorage.getItem('mediastate') !== 'null') {
			let localstoragemedias = JSON.parse(localStorage.getItem('mediastate'));
			this.setState({
				medias: localstoragemedias,
			});
		}
		this.getInstaBilder();
	}

	componentWillUnmount() {
		localStorage.setItem('mediastate', JSON.stringify(this.state.medias));
		axios.Cancel();
	}

	async getInstaBilder() {
		axios({
			method: 'GET',
			url: `${bilderpath}`,
			headers: { 'content-type': 'multipart/form-data' },
		})
			.then((response) => {
				if (typeof response.data === 'string') {
					this.setState({
						error: JSON.stringify(response.data),
					});
				} else {
					let newmedias = [];
					Object.values(response.data).map((media) => {
						if (media[0] === 'video') {
							newmedias.push({ isvideo: true, picurl: media[1], vidurl: media[2] });
						} else {
							newmedias.push({ isvideo: false, picurl: media[1] });
						}
						return null;
					});
					let mediassame = JSON.stringify(newmedias) === JSON.stringify(this.state.medias);
					if (!mediassame) {
						this.setState({ medias: newmedias });
					}
				}
			})
			.catch((error) => this.setState({ error: error.message }));
	}

	openModal(media) {
		if (media.isvideo) {
			this.setState({
				modalopen: true,
				mediasrc: media.vidurl,
				isvideo: true,
			});
		} else {
			this.setState({
				modalopen: true,
				mediasrc: media.picurl,
				isvideo: false,
			});
		}
	}

	closeModalHelper() {
		this.setState({
			modalopen: false,
			mediasrc: '',
		});
	}

	getModal() {
		if (this.state.isvideo) {
			return (
				<Dialog
					maxWidth={'sm'}
					open={this.state.modalopen}
					onClose={() => this.closeModalHelper()}
					transitionDuration={{ enter: 400 }}
				>
					<div style={{ position: 'fixed', padding: '5px', paddingLeft: '10px', zIndex: '400' }}>
						<button
							onClick={() => this.closeModalHelper()}
							style={{ all: 'unset', cursor: 'pointer' }}
						>
							<FontAwesomeIcon icon={faTimes} size='lg' color='white' />
						</button>
					</div>
					<video width='100%' height='100%' alt={''} controls autoplay='true'>
						<source src={this.state.mediasrc} type='video/mp4'></source>
					</video>
				</Dialog>
			);
		}
		return (
			<Dialog
				maxWidth={'sm'}
				open={this.state.modalopen}
				onClose={() => this.closeModalHelper()}
				transitionDuration={400}
			>
				<div style={{ position: 'fixed', padding: '5px', paddingLeft: '10px' }}>
					<button
						onClick={() => this.closeModalHelper()}
						style={{ all: 'unset', cursor: 'pointer' }}
					>
						<FontAwesomeIcon icon={faTimes} size='lg' color='white' />
					</button>
				</div>
				<img width='100%' height='100%' src={this.state.mediasrc} alt={''} />
			</Dialog>
		);
	}

	getMedia(media, i) {
		if (media.isvideo) {
			return (
				<button
					key={i}
					onClick={() => this.openModal(media)}
					style={{ all: 'unset', cursor: 'pointer' }}
				>
					<div
						style={{
							width: '100%',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							position: 'relative',
						}}
					>
						<div style={{ position: 'absolute', opacity: '0.5', color: 'white' }}>
							<FontAwesomeIcon icon={faPlay} size='3x' />
						</div>
						<img
							key={i}
							src={media.picurl}
							alt={''}
							style={{ width: '100%', display: 'block' }}
						/>
					</div>
				</button>
			);
		}
		return (
			<button key={i} onClick={() => this.openModal(media)} style={{ all: 'unset', cursor: 'pointer' }}>
				<img key={i} src={media.picurl} alt={''} style={{ width: '100%', display: 'block' }} />
			</button>
		);
	}

	render() {
		if (this.state?.medias?.length > 1) {
			return (
				<>
					{this.getModal()}
					<ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1200: 4, 1500: 5 }}>
						<Masonry gutter='20px'>
							{this.state.medias.map((media, i) => this.getMedia(media, i))}
						</Masonry>
					</ResponsiveMasonry>
				</>
			);
		} else if (this.state.error.length > 1) {
			return (
				<>
					<p>Bilder konnten nicht heruntergeladen werden:</p>
					<p>{this.state.error}</p>
				</>
			);
		} else {
			return (
				<>
					<div id='bilderladen'>
						<p>Die Bilder werden geladen:</p>
					</div>
					<div className='loader'></div>
				</>
			);
		}
	}
}
export default GetBilder;
