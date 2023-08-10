import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { storage } from '../utils/FirebaseConfig'
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';


function ProductModal() {
    const [show, setShow] = useState(false);
    const [brand, setBrand] = useState('')
    const [category, setCategory] = useState('')
    const [productName, setProductName] = useState("")
    const [thumbnail, setThumbnail] = useState(null)
    const [description, setDescription] = useState("")
    const [price, setPrice] = useState(0)
    const [images, setImages] = useState([])



    //API VALUES 
    const [brandVal, setBrandVal] = useState([])
    const [CategoryVal, setCategoryVal] = useState([])

    const handleClose = () => setShow(false);
    const handleShow = () => {
        axios.get('/api/get-all-brands').then(json => {
            setBrandVal(json.data.brands)
            axios.get('/api/all-categories').then(json => {
                setCategoryVal(json.data.categories)
                setShow(true);
            })
        }).catch(err => console.log(err))

    }

    const urls = []
    const MultipleImageUpload = () => images?.map((val) => {
        const MultipleImageRef = ref(storage, `/images/products/${productName}/${val.name}`);
        return uploadBytes(MultipleImageRef, val).then((snapshot) => {
            return getDownloadURL(snapshot.ref).then((url) => { urls.push(url) }).catch((error) => alert(error));
        });
    })






    const AddProduct = (e) => {
        e.preventDefault();
        const uploadImages = MultipleImageUpload()
        Promise.all(uploadImages)
            .then(() => {
                const storageRef = ref(storage, `/images/products/${productName}/${thumbnail.name}`);
                uploadBytes(storageRef, thumbnail).then((snapshot) => {
                    getDownloadURL(snapshot.ref)
                        .then((url) => {
                            const payload = {
                                productName,
                                brand,
                                category,
                                price,
                                images: urls,
                                thumbnail: url,
                                description

                            }
                            // console.log("Ready to hit the API", payload)

                            axios.post('/api/add-products', payload).then((json) => {
                                console.log(json.data)
                                setShow(false)
                            })
                                .catch(err => console.log(err))

                        })
                        .catch((error) => { console.log(error) });
                });
            })
            .catch(err => console.log(err))




    }

    return (
        <>
            <Button variant="dark" onClick={handleShow}>
                Add Product
            </Button>

            <Modal show={show} onHide={handleClose} centered backdrop="static" size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Add Product</Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <form onSubmit={AddProduct}>


                        <div className="row">
                            <div className="col">
                                <FloatingLabel controlId="productname" label="Product Name" className="mb-3 text-secondary"                                >
                                    <Form.Control type="text" placeholder="Product Name" value={productName} onChange={(e) => setProductName(e.target.value)} />
                                </FloatingLabel>
                            </div>
                            <div className="col">
                                <FloatingLabel controlId="price" label="Product Price ($)" className="mb-3 text-secondary"                                >
                                    <Form.Control type="number" placeholder="Product Price" value={price} onChange={(e) => setPrice(e.target.value)} />
                                </FloatingLabel>
                            </div>
                        </div>


                        <div className="mb-3">
                            <label htmlFor="thumbnail" className="form-label">
                                Product Thumbnail
                            </label>
                            <input className="form-control" onChange={(e) => setThumbnail(e.target.files[0])} type="file" id="thumbnail" />
                        </div>

                        <div className="mb-3">

                            <p className='mb-0 fw-semibold'>Choose Images</p>
                            <small className="text-secondary">Double Click to Delete Images</small>
                            <div className="mt-2 d-flex gap-2 align-items-center">
                                {
                                    images.map((val, key) =>
                                        <div key={key} className="bg-light border rounded col-md-1"
                                            onDoubleClick={() => setImages(images.filter((img) => img != val))}>
                                            <img style={{ height: '10vh', cursor: 'pointer', objectFit: 'contain' }}
                                                className='img-fluid' src={URL.createObjectURL(val)} alt="" />
                                        </div>)
                                }
                                <label htmlFor="formFile" style={{ height: '10vh', cursor: 'pointer' }} className="col-md-1 d-flex border border-dark border-2 justify-content-center align-items-center rounded  fs-3 fw-bold form-label">
                                    +
                                </label>
                            </div>


                            <input className="form-control d-none" onChange={(e) => setImages([...images, e.target.files[0]])} type="file" id="formFile" />
                        </div>


                        <div className="row">
                            <div className="col">
                                <Form.Group className="mb-3" >

                                    <FloatingLabel controlId="floatingSelectBrand" label="Select Brand">
                                        <Form.Select aria-label="Please Select a Brand" onChange={(e) => setBrand(e.target.value)}>
                                            <option>Please Select a Brand</option>
                                            {
                                                brandVal.map((val, key) => <option key={key} value={val.BrandName}>{val.BrandName}</option>)
                                            }
                                        </Form.Select>
                                    </FloatingLabel>
                                </Form.Group>
                            </div>
                            <div className="col">
                                <Form.Group className="mb-3" >
                                    <FloatingLabel controlId="selectCategory" label="Select Category">
                                        <Form.Select aria-label="Please Select a Category" onChange={(e) => setCategory(e.target.value)}>
                                            <option>Please Select a Category</option>
                                            {
                                                CategoryVal.map((val, key) => <option key={key} value={val.CategoryName}>{val.CategoryName}</option>)
                                            }
                                        </Form.Select>
                                    </FloatingLabel>
                                </Form.Group>
                            </div>
                        </div>





                        <FloatingLabel controlId="floatingTextarea2" label="Description" className='mb-3'>
                            <Form.Control
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                as="textarea"
                                placeholder="Leave a comment here"
                                style={{ height: '100px' }}
                            />
                        </FloatingLabel>





                        <button type="submit" className="btn btn-primary">
                            Submit
                        </button>
                    </form>
                </Modal.Body>

            </Modal>
        </>
    );
}

export default ProductModal;