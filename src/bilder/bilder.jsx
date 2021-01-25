
import React from "react"
import { componentDidMount, useState } from "react";
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"


// The number of columns change by resizing the window
class GetBilder extends React.Component {
    constructor(props){
        super(props);
        this.state={ images:[]}
        }

    }
    componentDidMount(){
        this.props.items.map((item) => {
            ImageStore.getImageById(item.imageId).then(image => {
                const mapping = {id: item.id, url: download_url};
                const newUrls = this.state.images.slice();
                newUrls.push(mapping);
    
                this.setState({ images: newUrls });
            })
        });
    }

    render() {
            
    

        return (
            
            <ResponsiveMasonry
                columnsCountBreakPoints={{350: 1, 750: 2, 900: 3, 1200: 4, 1500: 5}}
            >
                <Masonry gutter="20px">
                   {this.images.map((image, i) => (
                     
                    <img
                        key={i}
                        src={image}
                        alt={"image"}
                        style={{width: "100%", display: "block"}}                        
                    />
                   )
                   )}
                </Masonry>
            </ResponsiveMasonry>
        )
                   
    }


export default GetBilder;