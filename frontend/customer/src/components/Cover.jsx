import React, { useContext } from "react";
import "./Cover.css";
import { assets } from "../assets/assets";
import { ShopContext } from "../context/ShopContext";

function Cover() {
  const { settingsData } = useContext(ShopContext);

  const homeCover =
    settingsData && settingsData.length > 0
      ? settingsData[0].homeCoverImage
      : assets.cover; // fallback image

  return (
    <section className="cover-container">
      <div className="cover-image">
        <img src={homeCover} alt="Cover" draggable="false"/>
      </div>
    </section>
  );
}

export default Cover;
