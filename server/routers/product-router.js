import { Router } from "express";
import { productService, categoryService, reviewsService } from "../services";
import multer from "multer";
import is from '@sindresorhus/is';


const productRouter = Router();


//////////////////////이미지 저장을 위한 코드//////////////////////
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, `${file.originalname}`)
    }
});

const upload = multer({ storage: storage })
/////////////////////////////////////////////////////////////////
// 상품이 디비에 저장됨
productRouter.post('/',  async (req, res, next) => {
        //const{title,content,category} = req.body
        //const {title}=req.body
        //console.log(title)
        
        const saveProduct = await productService.addProduct(req.body)
       return saveProduct;
      
    
})

/// 디비에 있는 모든 상품 가지고 오기 
productRouter.get('/', async (req, res, next) => {
    try {
        console.log('들어옴')

        const products = await productService.getProductAll();
       console.log(products)
      
        res.status(200).json(products);
       return products;
    } catch (err) {
        next(err);
    }
})

//single 메소드의 인자인 'img'는 form의 필드중 name속성의 value이다.
productRouter.post('/register', upload.single('img'), async (req, res, next) => {
    try {

        let image = undefined;

        if (req.file)
            image = req.file.filename;

        //나중에 폼으로 대분류, 소분류 카테고리를 받아서 카테고리서비스를 통해 아이디를 가져와서 저장한다.
        const { name, price, description, brand, largeCategory, mediumCategory } = req.body

        if (!image || !name || !description || !brand || !largeCategory || !mediumCategory) {
            throw new Error("상품 정보를 모두 기입해 주세요");
        }

        const category = await categoryService.getSpecificCategory({ largeCategory, mediumCategory });

        const category_id = category._id;

        const product = await productService.addProduct({
            name,
            price,
            description,
            brand,
            category_id,
            image
        })

        res.status(200).json(product);
    } catch (err) {
        next(err);
    }
})

productRouter.patch('/:id', upload.single('img'), async (req, res, next) => {
    try {

        const id = req.params.id;
        const { name, price, description, brand, largeCategory, mediumCategory } = req.body
        let image;
        let category_id;

        if (req.file)
            image = req.file.filename;

        const category = await categoryService.getSpecificCategory({ largeCategory, mediumCategory })

        if (category)
            category_id = category._id;

        const toUpdate = {
            ...(image && { image }),
            ...(name && { name }),
            ...(price && { price }),
            ...(brand && { brand }),
            ...(description && { description }),
            ...(category_id && { category_id }),
        };

        const updatedProduct = await productService.updateProductInfo(id, toUpdate)

        res.status(200).json(updatedProduct);

    } catch (err) {
        next(err);
    }
})

productRouter.delete('/:id', async (req, res, next) => {
    try {
        const id = req.params.id;

        const result = await productService.deleteProduct(id);

        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
})

/////////////////////////////////////기능 추가/////////////////////////////////////
//상품 검색
productRouter.get('/:productName/search', async (req, res, next) => {
    try {
        const { productName } = req.params

        const searchedProducts = await productService.getSearchedProducts(productName);

        res.status(200).json(searchedProducts);

    } catch (err) {
        next(err);
    }
})
/////////////////////////////////////기능 추가/////////////////////////////////////

export { productRouter };