import {withRouter} from 'react-router-dom';

const NoContent = (props) => {
    setTimeout(() => {props.history.push('/')},2500)
    return (
        <h4>Die URL existiert nicht. Du wirst weitergeleitet.</h4>
    )
}

export default withRouter(NoContent);