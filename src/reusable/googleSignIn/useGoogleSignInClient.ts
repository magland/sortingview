import { useContext } from "react"
import GoogleSignInContext from "./GoogleSignInContext"

const useGoogleSignInClient = () => {
    return useContext(GoogleSignInContext).client
}

export default useGoogleSignInClient