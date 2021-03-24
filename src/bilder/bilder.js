
import React from "react"
import { Component } from "react";
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry";
import './bilder.css';
import axios from 'axios';
import {Dialog} from '@material-ui/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faTimes} from '@fortawesome/free-solid-svg-icons'

const bilderpath = 'https://juliusannafelix.ddns.net/getinsta.php';

class GetBilder extends Component {

    constructor(props) {
		super(props)
		this.state = {
			images:[] ,
            error:'',
            modalopen:false,
		}
	}

    componentDidMount() {
        if(localStorage.getItem('bilderstate')!=='null'){
            let localstorageimages = JSON.parse(localStorage.getItem('bilderstate'))
            this.setState({
                images: localstorageimages,
            })
        }
        this.getInstaBilder();
    }

    componentWillUnmount(){
        localStorage.setItem('bilderstate',JSON.stringify(this.state.images));
        axios.Cancel();
    }

    async getInstaBilder(){
        axios({
			method:'GET',
			url: `${bilderpath}`,
			headers: { 'content-type': 'multipart/form-data' },
		  })
			.then(response => {
                if(typeof response.data === "string"){
                    this.setState({
                        error: JSON.stringify(response.data)
                    })
                }
                else{
                    let newimages = [];
                    Object.values(response.data).map((img) => newimages.push(img));
                    let imagessame = JSON.stringify(newimages) === JSON.stringify(this.state.images);
                    if(!imagessame){
                        this.setState({ images: newimages });
                    }
                } 
			})
			.catch(error => this.setState({ error: error.message }));
    }

    openModal(imagesrc){
        this.setState({
            modalopen:true,
            imagesrc: imagesrc,
        })
    }
    
    closeModalHelper(){
        this.setState({
            modalopen : false,
            imagesrc: '',
        })
    }
    

    render() {
        if (this.state?.images?.length>1){
        return (
            <>
                <Dialog
                    maxWidth={'sm'}
                    open={this.state.modalopen}
                    onClose={() => this.closeModalHelper()}
                    transitionDuration={300}
                >
                    <div style={{position:'fixed', padding: '5px', paddingLeft: '10px'}}>
                        <button onClick={() => this.closeModalHelper()} style={{all: 'unset', cursor:'pointer'}}>
                            <FontAwesomeIcon icon={faTimes} size="lg" color="white"/>
                        </button>
                    </div>
                    <img
                        width="100%"
                        height="100%"
                        src={this.state.imagesrc}
                        alt={""}
                    />
                </Dialog>
            <ResponsiveMasonry
                columnsCountBreakPoints={{350: 1, 750: 2, 900: 3, 1200: 4, 1500: 5}}
            >
                <Masonry gutter="20px">
                   {this.state.images.map((image, i) => (
                    <button key ={i} onClick={() => this.openModal(image)} style={{all : 'unset', cursor:'pointer'}}>
                        <img
                            key={i}
                            src={image}
                            alt={""}
                            style={{width: "100%", display: "block"}}                        
                        />
                    </button>
                   )
                   )}
                </Masonry>
            </ResponsiveMasonry>
            </>
        )
        }
        else if(this.state.error.length>1){
            return(      
            <>
                <p>Bilder konnten nicht heruntergeladen werden:</p>
                <p>{this.state.error}</p>
            </>
            )
        }
        else{
            return (
            <>
                <div id="bilderladen">
                <p>Die Bilder werden geladen:</p>
                </div>
                 <div className="loader"></div>
            </>)
        }
    }

}
export default GetBilder;