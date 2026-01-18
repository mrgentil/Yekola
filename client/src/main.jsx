import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AppContextProvider } from "./context/AppContext.jsx";
import { SiteContextProvider } from "./context/SiteContext.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
	<BrowserRouter>
		<AuthProvider>
			<SiteContextProvider>
				<AppContextProvider>
					<App />
				</AppContextProvider>
			</SiteContextProvider>
		</AuthProvider>
	</BrowserRouter>
);
