import { jellyTriangle } from 'ldrs'
import './styles/preloader.css'

jellyTriangle.register()

// Default values shown

function PreLoader(props) {
    let loaderState = props.isLoading ? 'show' : 'show';
    return (
        <>
            <div className={"preloader " + loaderState}>
                <l-jelly-triangle
                    size="50"
                    speed="1.75"
                    color='var(--primary-color)'
                ></l-jelly-triangle>
            </div>
        </>
    );
}
export default PreLoader;