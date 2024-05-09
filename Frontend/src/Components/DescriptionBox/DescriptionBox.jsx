import React from "react";

import "./DescriptionBox.css";

const DescriptionBox = () => {
  return (
    <div className="descriptionbox">
      <div className="descriptionbox-navigator">
        <div className="descriptionbox-nav-box">Description</div>
        <div className="descriptionbox-nav-box fade">Reviews (122)</div>
      </div>
      <div className="descriptionbox-description">
        <p>
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Doloribus
          exercitationem ea ab numquam at ex, doloremque, itaque blanditiis
          repellendus nemo aut odio cum possimus cupiditate tempore assumenda
          reprehenderit, architecto dicta?
        </p>
        <p>
            Quasi quod voluptates iure nisi temporibus fugiat accusantium
        </p>
      </div>
    </div>
  );
};

export default DescriptionBox;
