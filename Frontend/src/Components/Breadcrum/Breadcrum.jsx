import React from 'react';

import arrow_icon from '../Assets/breadcrum_arrow.png'

import './Breadcrum.css';

const Breadcrum = (props) => {
    const { product } = props;
  return (
    <div className="breadcrum">
        home<img src={arrow_icon} alt="arrow_icon" />shop<img src={arrow_icon} alt="" />{product.category}<img src={arrow_icon} alt="" />{product.name}
    </div>
  )
}

export default Breadcrum