import React, { useEffect, useRef, useState } from "react";
import { setShowSearchSuggestions, toggleMenu } from "../utils/appSlice";
import { useDispatch, useSelector } from "react-redux";
import { YOUTUBE_SEARCH_SUGGESTION_API } from "../utils/constants";
import { addCacheData } from "../utils/searchCacheSlice";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const showSearchSuggestions = useSelector(
    (store) => store.app.showSearchSuggestions
  );
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const searchRef = useRef(null);

  const searchCacheData = useSelector((store) => store.searchCache);

  //To Handle Search API and debouncing

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchCacheData[searchQuery])
        setSearchSuggestions(searchCacheData[searchQuery]);
      else getSearchSuggestions();
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  //To handle Search List hidden or shown on Scrolling

  useEffect(() => {
    const handleScroll = () => {
      if (showSearchSuggestions && searchSuggestions && window.scrollY > 50) {
        dispatch(setShowSearchSuggestions(false));
      }

      if (
        !showSearchSuggestions &&
        document.activeElement === searchRef.current &&
        searchSuggestions &&
        window.scrollY < 50
      ) {
        dispatch(setShowSearchSuggestions(true));
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [showSearchSuggestions]);

  const toggleMenuHandler = () => {
    dispatch(toggleMenu());
  };

  const getSearchSuggestions = async () => {
    const data = await fetch(YOUTUBE_SEARCH_SUGGESTION_API + searchQuery);
    const json = await data.json();

    setSearchSuggestions(json[1]);
    dispatch(
      addCacheData({
        [searchQuery]: json[1],
      })
    );
  };

  return (
    <div className="flex flex-row p-2 mb-2 shadow-lg justify-between">
      <div className="flex col-span-1">
        <img
          onClick={() => toggleMenuHandler()}
          alt="menu"
          className="h-8 my-3 cursor-pointer"
          src="https://icons.veryicon.com/png/o/miscellaneous/linear-icon-45/hamburger-menu-5.png"
        />

        <Link to="/">
          <img
            alt="logo"
            className="h-14 w-28 ml-2"
            src="https://cdn.mos.cms.futurecdn.net/8gzcr6RpGStvZFA2qRt4v6-1200-80.jpg.webp"
          />
        </Link>
      </div>

      <div>
        <div>
          {" "}
          <input
            ref={searchRef}
            className="w-[500px] rounded-l-full p-2 border-2 
          border-black-400"
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => dispatch(setShowSearchSuggestions(true))}
          />
          <button
            className="bg-gray-100 px-5 py-2 rounded-r-full border-2 border-black-100"
            onClick={() => navigate("/search?query=" + searchQuery)}
          >
            {" "}
            🔍{" "}
          </button>
        </div>

        <div className="fixed bg-white w-[35rem]">
          <ul>
            {showSearchSuggestions &&
              searchSuggestions.map((item) => (
                <li
                  onClick={() => setSearchQuery(item)}
                  className="py-2 px-5 hover:bg-gray-200"
                >
                  {" "}
                  <Link to={"/search?query=" + item}> 🔍 {item} </Link>
                </li>
              ))}
          </ul>
        </div>
      </div>

      <div className="m-2">
        <img
          alt="profile-icon"
          className="h-8"
          src="https://freesvg.org/img/abstract-user-flat-4.png"
        />
      </div>
    </div>
  );
};

export default Header;
