import {create} from "zustand"
import axios from "axios"

const API_URL = 'http://localhost:5000/api/auth';

axios.defaults.withCredentials = true;

export const useAuthStore = create((set)=>({
  user: null,
  isAuthenticated: false,
  error:null,
  isLoading: false,
  isCheckingAuth: true, // this state tells us whether to show home page or signup page based on user authenticated or not

  signup: async(email, password, name)=>{
    set({ isLoading:true, error:null});
    try{
      const response = await axios.post(`${API_URL}/signup`, { email,password,name},{ withCredentials: true });
      
      //we use response.data.user cause we used 'user' in response in signupcontroller 
      set({user: response.data.user, isAuthenticated:true, isLoading:false});
      console.log("Updated state:", useAuthStore.getState());

    }catch(error){
      set({error: error.response.data.message || "Error Signing up", isLoading: false});
      throw error;
    }
  },

  login : async (email,password) =>{
    set({isLoading:true, error:null});
    try {
      const response = await axios.post(`${API_URL}/login`, { email,password},{ withCredentials: true }); 
      set({
        isAuthenticated:true,
        user: response.data.user,
        isLoading: false,
        error:null
      })   
    } catch (error) {
      set({error: error.response?.data?.message || "error Logging in", isLoading: false});
      throw error;
    }
  },

  logout : async () => {
    set({ isLoading:true, error: null});
    try {
      await axios.post(`${API_URL}/logout`);
      set({user: null, isAuthenticated: false, error: null, isLoading: false});

    } catch (error) {
      set({error: "Error Logging out", isLoading: false});
      throw error;
      
    }
  },

  verifyEmail: async (code) =>{
    set({ isLoading:true, error:null});
    try{
      const response = await axios.post(`${API_URL}/verify-email`, { code});
      set ({user: response.data.user, isAuthenticated:true,isLoading:false});

      return response.data;
    }catch(err){
      set({error: err.response.data.message || "Error Verifying email", isLoading: false});
      throw err;

    }

  },

  checkAuth: async () => {
    // await new Promise((res)=> setTimeout(res,2000));
		set({ isCheckingAuth: true, error: null });
		try {
      
			const response = await axios.get(`${API_URL}/check-auth`);

			set({ user: response.data.user, isAuthenticated: true, isCheckingAuth: false });
		} catch (error) {
			set({ error: null, isCheckingAuth: false, isAuthenticated: false });
		}
	},

  forgotPassword : async (email) => {
    set({isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/forgot-password`,{ email });
      set({message: response.data.message, isLoading: false})
    } catch (error) {
      set({ isLoading: false});
      throw error;
      
    }
  },

  resetPassword : async (token, password)=>{
    set({ isLoading: true, error: null});
    try {
      const response = await axios.post(`${API_URL}/reset-password/${token}`,{ password });
      set({ message: response.data.message, isLoading: false });

    } catch (error) {
      set({
        isLoading: false,
        error: error.response.data.message || "Error resetting password",
      });
      throw error;
      
    }

  }
  
}))