import Register from './components/Register';
import ipConfig from './ipConfig.json';
import { Route, Switch } from 'react-router-dom';
import Login from './components/Login';
import Products from './components/Products';
import Checkout from './components/Checkout';
import Thanks from './components/Thanks';

export const config = {
    //endpoint: `http://${ipConfig.workspaceIp}:8082/api/v1`,
    //endpoint: `https://qkart-frontend-module.herokuapp.com/api/v1`,
    endpoint: `https://qkart-node-server.onrender.com/v1`,
};

function App() {
    return (
        <div className="App">
            {/* TODO: CRIO_TASK_MODULE_LOGIN - To add configure routes and their mapping */}
            <Switch>
                <Route exact path="/thanks" component={Thanks} />
                <Route exact path="/checkout" component={Checkout} />
                <Route exact path="/register" component={Register} />
                <Route exact path="/login" component={Login} />
                <Route exact path="/" component={Products} />
            </Switch>
        </div>
    );
}

export default App;
