import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import './styles/chipPeople.css';
import '@material/web/all';
const PeopleChip = (props) => {
    const thisChip = useRef(null);
    const [label, setLabel] = useState('');
    const [imgUrl, setImgUrl] = useState('');
    // const onRemove = useState()
    useEffect(() => {
        if (props.label)
            setLabel(props.label)
        if (props.imgUrl)
            setImgUrl(props.imgUrl)
    }, []);
    const test = () => {

    }
    return (

        // <md-input-chip id={props.id} useRef={thisChip} onClick={props.onClick} onRemove={props.onClick} avatar label={props.label}>
        //     <img slot="icon" src="https://lh3.googleusercontent.com/a/default-user=s48" />
        // </md-input-chip>
        <div className="chip-people" onClick={props.onClick}>
            <img className="chip-people-avater" src={imgUrl} />
            <span className="label">{label}</span>
            {props.onRemove ?
                <span className="material-symbols-rounded close-icon" onClick={props.onRemove}>close
                    <md-ripple></md-ripple>
                </span>
                : <></>
            }
            <md-ripple></md-ripple>

        </div>
    )
}

export default PeopleChip;