import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../../services/apiRestaurant';
import Button from '../../ui/Button';
import EmptyCart from '../cart/EmptyCart';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart, getCart, getTotalCartPrice } from '../cart/cartSlice';
import store from '../../store';
import { formatCurrency } from '../../utils/helpers';
import { fetchAddress } from '../user/userSlice';
import { useForm } from "react-hook-form";
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import Loader from '../../ui/Loader';

const schema = yup.object({
  firstName: yup.string().required("Name is required").min(1,'Min 1 character'),
  phoneNumber: yup.string()
    .required("Phone number is required")
    .matches(/^\+?\d{8,15}$/,'Phone number is not valid'),
  address: yup.string()
    .required("Your Address is required")
    .min(10,"Min 10 chars"),
});

function CreateOrder() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector(getCart);
  const totalCartPrice = useSelector(getTotalCartPrice);
const [isSubmitting, setIsSubmitting] = useState(false);
  const [withPriority, setWithPriority] = useState(false);

  const { position, addressStatus, error: errorAddress } = useSelector(state => state.user);
  const isLoadingAddress = addressStatus === 'loading';

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { firstName: "", phoneNumber: "", address: "" }
  });

  const priorityPrice = withPriority ? totalCartPrice * 0.2 : 0;
  const totalPrice = totalCartPrice + priorityPrice;

  if (!cart.length) return <EmptyCart />;

const onSubmit = async (data) => {
  const order = {
    customer: data.firstName,
    phone: data.phoneNumber,
    address: data.address,
    priority: withPriority,
    position: position.latitude && position.longitude ? `${position.latitude},${position.longitude}` : '',
    cart: cart.map(item => ({
      pizzaId: item.pizzaId,
      name: item.name,  
      quantity: item.quantity || item.amount,  
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    })),
  };
  console.log("Sending order:", order);
  try {
    const newOrder = await createOrder(order);
    dispatch(clearCart());
    navigate(`/order/${newOrder.id}`);
  } catch (err) {
    console.error('Failed creating your order:', err);
    alert(err.message);
  }
};



  return (
    <div className="px-4 py-6">
      <h2 className="mb-8 text-xl font-semibold">Ready to order? Let's go!</h2>

      <form onSubmit={handleSubmit(onSubmit)}>


        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">

          <label className="sm:basis-40">First Name</label>

          <div className="grow">

            <input className="input w-full" {...register('firstName')} />


            {errors.firstName && <p className="text-red-400">{errors.firstName.message}</p>}
         
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
        
          <label className="sm:basis-40">Phone number</label>
          <div className="grow">

            <input className="input w-full" type="tel" {...register('phoneNumber')} />
           
           
            {errors.phoneNumber && <p className="text-red-400">{errors.phoneNumber.message}</p>}
         
          </div>
        </div>

       
        <div className="relative mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
       
          <label className="sm:basis-40">Address</label>

          <div className="grow">


            <input className="input w-full" disabled={isLoadingAddress} {...register('address')} />


            {errors.address && <p className="text-red-400">{errors.address.message}</p>}


            {addressStatus === 'error' && <p className="text-red-400">{errorAddress}</p>}

          </div>


          {!position.latitude && !position.longitude && (

            <span className="absolute right-1 top-1">

              <Button
                disabled={isLoadingAddress}
                type="small"
                onClick={(e) => { e.preventDefault();

                    dispatch(fetchAddress());
                }}>

                {isLoadingAddress ? <Loader /> : 'Get position'}

              </Button>
            </span>
          )}
        </div>

        <div className="mb-12 flex items-center gap-5">
          <input type="checkbox" checked={withPriority} onChange={(e) => setWithPriority(e.target.checked)} />

          <label className="font-medium">Want to give your order priority?</label>

        </div>


        <Button type="primary" disabled={isLoadingAddress || isSubmitting}>
  
  {isSubmitting || isLoadingAddress ? <Loader /> : `Order now ${formatCurrency(totalPrice)}`}

        </Button>
      </form>
    </div>
  );
}

export default CreateOrder;
