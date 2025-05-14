import { createContext, useContext, useState } from "react";
const UserContext = createContext();

export function UserProvider({children}){
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    return (
        <UserContext.Provider value = {{userName, setUserName, email, setEmail}}>
            {children}
        </UserContext.Provider>
    )
}
export function useUser(){
    return useContext(UserContext);
}