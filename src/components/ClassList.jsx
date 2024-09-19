import { useEffect, useState } from "react";
import { auth, db } from "./Firebase";
import '@material/web/all';
import { collection, getDoc, getDocs, query, where } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import './styles/classlist.css';


function ClassList(selectedClass) {
    const [classes, setClasses] = useState([]);
    const getClasses = async () => {
        const currentUser = auth.currentUser;
        const classDBRef = collection(db, "classes");
        const filteredQuery = query(classDBRef, where('classOwner', '==', currentUser.uid));
        const querySnapshot = await getDocs(filteredQuery);
        // querySnapshot.forEach((doc) => {
        //     console.log(`${doc.id} => ${doc.data()}`);
        // });22
        const itemsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClasses(itemsData);
    }


    useEffect(() => {
        if (auth.currentUser !== null)
            getClasses();
    }, [auth.currentUser]);


    return (
        <>
            <div className="classlist-container">
                {classes.map((item, index) => (
                    <div key={item.id} className="class-item">
                        <div className="class-img" style={{ backgroundImage: `url('anims/default-class-bg.png')` }}>
                            <span className="class-img-filter"></span>
                        </div>
                        <h4 className="class-title">{item.className}</h4>
                        <p className="class-desc">{item.classDesc}</p>
                        <div className="class-item-actions">

                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
export default ClassList;