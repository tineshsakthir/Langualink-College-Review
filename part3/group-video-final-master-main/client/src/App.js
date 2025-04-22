import React from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Home from "./routes/Home";
import Room from "./routes/Room";

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact component={Home} />
        <Route path="/room/:roomID" component={Room} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
