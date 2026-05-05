import "./Header.css";

export function HeaderHTML(){
    return(
        <div className="Header">
            
            <nav className="nav">
                <div>
                    <span id="name">Mekuanint</span>
                    <a href="Home">Home</a>
                    <a href="#Contacts">Contacts</a>
                    <a href="#projects">Projects</a>
                    <a href="#aboutMe">About</a>
                    <a href="#Skills">Skills</a>
                    <img src="src\assets\images\profileImg.png" alt="profile Image" className="profileImage" />

                </div>
            </nav>
            
        </div>
    )
}