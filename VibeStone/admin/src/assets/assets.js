import logo from './logo.png'
import add_icon from './add_icon.png'
import order_icon from './order_icon.png'
import profile_image from './profile_image.png'
import upload_area from './upload_area.png'
import parcel_icon from './parcel_icon.png'

export const url = window.location.origin.includes('localhost') 
  ? 'http://localhost:5000' 
  : 'https://vibe-stone-backend.vercel.app'
export const currency = ' VNĐ'

export const assets ={
    logo,
    add_icon,
    order_icon,
    profile_image,
    upload_area,
    parcel_icon
}

