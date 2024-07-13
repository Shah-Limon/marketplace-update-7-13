const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
require("dotenv").config();
const port = process.env.PORT || 5000;

const app = express();
const myEmail = process.env.SMTP_USER
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendMail = async (from, to, subject, content) => {
  const mailOptions = {
    from: from,
    to: to,
    subject: subject,
    text: content,
  };
  const fm = await transporter.sendMail(mailOptions);
  if (fm) {
    return fm
  } else { return "not sent" }
};

app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://freelancer:freelancer@freelancer.obnwb8p.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    /* new collection */
    const usersCollection = client.db("marketPlaceDB").collection("users");

    const orderCollections = client.db("marketPlaceDB").collection("orders");
    const paypalEmailCollections = client
      .db("marketPlaceDB")
      .collection("paypalEmail");
    const commissionCollections = client
      .db("marketPlaceDB")
      .collection("commission");
    const logoCollections = client.db("marketPlaceDB").collection("logo");
    const BannerOptionCollections = client
      .db("marketPlaceDB")
      .collection("Banner");
    const supportMessageCollections = client
      .db("marketPlaceDB")
      .collection("supportMessage");
    const ContactMessageCollections = client
      .db("marketPlaceDB")
      .collection("contactMessage");

    /* Seller */
    const productsCollection = client
      .db("marketPlaceDB")
      .collection("products");
    const categoriesCollection = client
      .db("marketPlaceDB")
      .collection("categories");
    const withdrawCollection = client
      .db("marketPlaceDB")
      .collection("withdraw");

    /* Buyer */

    const reviewsCollection = client.db("marketPlaceDB").collection("reviews");

    /* start */
    /*
     *** usersCollection
     */
    app.post("/add-user", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get("/emails/seller", async (req, res) => {
      const userEmail = req.query.userEmail; // Corrected to match query parameter

      if (userEmail) {
        const response = await sendMail(
          myEmail,
          userEmail,
          "You got an order",
          "You've bought a new order"
        );

        if (response.accepted) {

          res.send(response);
        } else {
          res.send("Email not sent");
        }

      }

    });
    app.get("/emails/Buyer", async (req, res) => {
      const userEmail = req.query.userEmail; // Corrected to match query parameter

      if (userEmail) {
        const response = await sendMail(
          myEmail,
          userEmail,
          "Thanks For Purchasing",
          "You've bought a new order"
        );

        if (response.accepted) {

          res.send(response);
        } else {
          res.send("Email not sent");
        }

      }

    });
    app.get("/users", async (req, res) => {
      const userEmail = req.query.userEmail; // Corrected to match query parameter
      const query = {};
      if (userEmail) {
        query.UserEmail = userEmail;
      }
      const cursor = usersCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    });


    app.get("/user/:id", async (req, res) => {
      const id = req.params.id;
      if (!id || id.length !== 24) {
        return res.status(400).send("Invalid id format");
      }
      try {
        const query = { _id: ObjectId(id) };
        const user = await usersCollection.findOne(query);
        res.send(user);
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.put("/update-user/:id", async (req, res) => {
      const id = req.params.id;
      const edit = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          userName: edit.userName,
          profileURL: edit.profileURL,
          currentBalance: edit.currentBalance,
          userRole: edit.userRole,
          UserEmail: edit.UserEmail,
          address: edit.address,
          city: edit.city,
          country: edit.country,
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });
    app.put("/update-user-profile/:id", async (req, res) => {
      const id = req.params.id;
      const edit = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          userName: edit.userName,
          profileURL: edit.profileURL,
          address: edit.address,
          city: edit.city,
          country: edit.country,
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });



    app.put("/user-balance/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const edit = req.body;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updatedDoc = {
          $set: {
            currentBalance: parseFloat(edit.currentBalance), // Convert to number if needed
          },
        };
        const result = await usersCollection.updateOne(
          filter,
          updatedDoc,
          options
        );
        res.send(result);
      } catch (error) {
        console.error("An error occurred:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    /* paypalEmailCollections */
    app.post("/payment", async (req, res) => {
      const email = req.body;
      const result = await paypalEmailCollections.insertOne(email);
      res.send(result);
    });

    app.get("/payments", async (req, res) => {
      const query = {};
      const cursor = paypalEmailCollections.find(query);
      const email = await cursor.toArray();
      res.send(email);
    });
    app.get("/payment/:id", async (req, res) => {
      const query = {};
      const cursor = paypalEmailCollections.find(query);
      const email = await cursor.toArray();
      res.send(email);
    });

    app.put("/payment/:id", async (req, res) => {
      const id = req.params.id;
      const updateEmail = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          email: updateEmail.email,
        },
      };

      const result = await paypalEmailCollections.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    /* commissionCollections */
    app.post("/add-commission", async (req, res) => {
      const commission = req.body;
      const result = await commissionCollections.insertOne(commission);
      res.send(result);
    });

    app.get("/commissions", async (req, res) => {
      const query = {};
      const cursor = commissionCollections.find(query);
      const commissions = await cursor.toArray();
      res.send(commissions);
    });
    app.get("/commission/:id", async (req, res) => {
      const query = {};
      const cursor = commissionCollections.find(query);
      const commission = await cursor.toArray();
      res.send(commission);
    });

    app.put("/commission/:id", async (req, res) => {
      const id = req.params.id;
      const update = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          commission: update.commission,
        },
      };

      const result = await commissionCollections.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    /* supportMessageCollections */

    app.post("/new-support-message", async (req, res) => {
      const order = req.body;
      const result = await supportMessageCollections.insertOne(order);
      res.send(result);
    });

    app.get("/support-messages", async (req, res) => {
      const userEmail = req.query.userEmail;
      const query = {};
      if (userEmail) {
        query.ticketUserEmail = userEmail; // Change from customerEmail to ticketUserEmail
      }
      const cursor = supportMessageCollections.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    });

    app.get("/support-message/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const order = await supportMessageCollections.findOne(query);
      res.send(order);
    });

    app.put("/support-message-status/:id", async (req, res) => {
      const id = req.params.id;
      const updateOrder = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          ticketStatus: updateOrder.ticketStatus,
          adminMessage: updateOrder.adminMessage,
        },
      };
      const result = await supportMessageCollections.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    /* end */

    /***  Seller Part Start  ***/
    /* productsCollection */

    app.post("/add-product", async (req, res) => {
      const user = req.body;
      const result = await productsCollection.insertOne(user);
      res.send(result);
    });

    app.get("/products", async (req, res) => {
      try {
        const sellerEmail = req.query.sellerEmail;
        const query = {};
        if (sellerEmail) {
          query.sellerEmail = sellerEmail;
        }
        const cursor = productsCollection.find(query);
        const users = await cursor.toArray();
        res.send(users);
      } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.get("/product-details", async (req, res) => {
      try {
        const productSlug = req.query.productSlug; // Extract categorySlug from query parameters

        let query = {};
        if (productSlug) {
          query = { productSlug: productSlug }; // Create a query object with the categorySlug if provided
        }

        const cursor = productsCollection.find(query);
        const products = await cursor.toArray();

        res.send(products);
      } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Internal Server Error");
      }
    });
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await productsCollection.findOne(query);
      res.send(service);
    });

    app.put("/product/:id", async (req, res) => {
      const id = req.params.id;
      const edit = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          productName: edit.productName,
          productDescription: edit.productDescription,
          price: edit.price,
          featuredImage: edit.featuredImage,
          productImageOne: edit.productImageOne,
          productImageTwo: edit.productImageTwo,
          productImageThree: edit.productImageThree,
          accessLink: edit.accessLink,
          guideLine: edit.guideLine,
        },
      };

      const result = await productsCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);

      // DELETE a product
      app.delete("/delete-product/:id", async (req, res) => {
        try {
          const productId = req.params.id;
          console.log("Received request to delete product with ID:", productId);
          const result = await productsCollection.deleteOne({
            _id: ObjectId(productId),
          });
          if (result.deletedCount === 1) {
            res.status(200).json({ message: "Product deleted successfully" });
          } else {
            res.status(404).json({ message: "Product not found" });
          }
        } catch (error) {
          console.error("Error deleting product:", error);
          res.status(500).json({ message: "Internal server error" });
        }
      });
    });

    app.get("/category", async (req, res) => {
      try {
        const categorySlug = req.query.categorySlug; // Extract categorySlug from query parameters

        let query = {};
        if (categorySlug) {
          query = { categorySlug: categorySlug }; // Create a query object with the categorySlug if provided
        }

        const cursor = productsCollection.find(query);
        const products = await cursor.toArray();

        res.send(products);
      } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    /* categoriesCollection */

    app.post("/add-category", async (req, res) => {
      const user = req.body;
      const result = await categoriesCollection.insertOne(user);
      res.send(result);
    });

    app.get("/categories", async (req, res) => {
      try {
        const sellerEmail = req.query.sellerEmail;
        const query = {};
        if (sellerEmail) {
          query.sellerEmail = sellerEmail;
        }
        const cursor = categoriesCollection.find(query);
        const users = await cursor.toArray();
        res.send(users);
      } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.get("/seller-category/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await categoriesCollection.findOne(query);
      res.send(service);
    });

    app.put("/seller-category/:id", async (req, res) => {
      const id = req.params.id;
      const publishStatus = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          categoryName: publishStatus.categoryName,
        },
      };

      const result = await categoriesCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.delete("/seller-category/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };

      try {
        const result = await categoriesCollection.deleteOne(filter);
        if (result.deletedCount === 1) {
          res.status(200).json({ message: "User deleted successfully" });
        } else {
          res.status(404).json({ message: "User not found" });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    /* withdrawCollection */

    app.post("/add-withdraw", async (req, res) => {
      try {
        const { withdrawalUserEmail, withdrawalAmount } = req.body;
        const seller = await usersCollection.findOne({
          UserEmail: withdrawalUserEmail,
        });
        if (!seller) {
          return res.status(404).send("Seller not found");
        }
        if (parseFloat(withdrawalAmount) > parseFloat(seller.currentBalance)) {
          return res.status(400).send("Insufficient balance");
        }
        const updatedBalance =
          parseFloat(seller.currentBalance) - parseFloat(withdrawalAmount);
        await usersCollection.updateOne(
          { UserEmail: withdrawalUserEmail },
          { $set: { currentBalance: updatedBalance } }
        );
        const result = await withdrawCollection.insertOne(req.body);
        res.send(result);
      } catch (error) {
        console.error("Error adding withdrawal:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.get("/all-withdraw", async (req, res) => {
      try {
        const withdrawalUserEmail = req.query.withdrawalUserEmail;
        const query = {};
        if (withdrawalUserEmail) {
          query.withdrawalUserEmail = withdrawalUserEmail;
        }
        const cursor = withdrawCollection.find(query);
        const users = await cursor.toArray();
        res.send(users);
      } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send("Internal Server Error");
      }
    });
    app.get("/withdraw/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await withdrawCollection.findOne(query);
      res.send(service);
    });

    // app.put('/withdraw-status/:id', async (req, res) => {
    //     const id = req.params.id;
    //     const edit = req.body;
    //     const filter = { _id: ObjectId(id) };
    //     const options = { upsert: true };
    //     const updatedDoc = {
    //         $set: {
    //             withdrawalStatus: edit.withdrawalStatus,
    //         }
    //     };
    //     const result = await withdrawCollection.updateOne(filter, updatedDoc, options);
    //     res.send(result);
    // });

    app.put("/withdraw-status/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const edit = req.body;
        const filter = { _id: ObjectId(id) };
        const withdrawal = await withdrawCollection.findOne(filter);

        // Check if the withdrawal status is being changed to cancelled
        if (
          withdrawal.withdrawalStatus !== "cancelled" &&
          edit.withdrawalStatus === "cancelled"
        ) {
          // If the withdrawal is cancelled, add the withdrawal amount back to the seller's balance
          const seller = await usersCollection.findOne({
            UserEmail: withdrawal.withdrawalUserEmail,
          });
          if (!seller) {
            return res.status(404).send("Seller not found");
          }
          const updatedBalance =
            parseFloat(seller.currentBalance) +
            parseFloat(withdrawal.withdrawalAmount);
          await usersCollection.updateOne(
            { UserEmail: withdrawal.withdrawalUserEmail },
            { $set: { currentBalance: updatedBalance } }
          );
        }

        const options = { upsert: true };
        const updatedDoc = {
          $set: {
            withdrawalStatus: edit.withdrawalStatus,
          },
        };
        const result = await withdrawCollection.updateOne(
          filter,
          updatedDoc,
          options
        );
        res.send(result);
      } catch (error) {
        console.error("Error updating withdrawal status:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    /***   Seller Part End  ***/

    /***  buyer Part Start  ***/

    /* reviewsCollection */

    app.post("/add-review", async (req, res) => {
      const user = req.body;
      const result = await reviewsCollection.insertOne(user);
      res.send(result);
    });

    app.get("/product-reviews", async (req, res) => {
      try {
        const productId = req.query.productId;
        let query = {};
        if (productId) {
          query = { productId };
        }
        const cursor = reviewsCollection.find(query);
        const reviews = await cursor.toArray();
        res.send(reviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.get("/product-review/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await productsCollection.findOne(query);
      res.send(service);
    });

    app.get("/category", async (req, res) => {
      try {
        const category = req.query.category;
        let query = {};

        if (category && category.trim() !== "") {
          query.category = decodeURIComponent(category);
        }
        const cursor = productsCollection.find(query);
        const products = await cursor.toArray();
        res.send(products);
      } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    /***  buyer Part end  ***/

    /* Order */
    app.post("/new-order", async (req, res) => {
      const order = req.body;
      const result = await orderCollections.insertOne(order);
      res.send(result);
    });

    app.get("/orders", async (req, res) => {
      const userEmail = req.query.userEmail;
      const sellerEmail = req.query.sellerEmail;
      const query = {};
      if (userEmail) {
        query.customerEmail = userEmail;
      }
      if (sellerEmail) {
        query.sellerEmail = sellerEmail;
      }
      const cursor = orderCollections.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    });

    app.get("/order/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const order = await orderCollections.findOne(query);
      res.send(order);
    });



    app.get('/order-by-id', async (req, res) => {
      const paymentId = req.query.paymentId;
      const query = { paymentId: paymentId }; // Use the orderId from the query parameters

      try {
        const order = await orderCollections.findOne(query);
        if (!order) {
          return res.status(404).send({ error: 'Order not found' });
        }
        res.send(order);
      } catch (error) {
        console.error('Error fetching order by orderId', error);
        res.status(500).send({ error: 'An error occurred while fetching the order' });
      }
    });


    app.put("/order-status/:id", async (req, res) => {
      const id = req.params.id;
      const updateOrder = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          orderStatus: updateOrder.orderStatus,
          paymentStatus: updateOrder.paymentStatus,
        },
      };

      const result = await orderCollections.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.put("/update-note-buyer/:id", async (req, res) => {
      const id = req.params.id;
      const updateOrder = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          buyerAddedNote: updateOrder.buyerAddedNote,
          noteAddedByBuyer: updateOrder.noteAddedByBuyer,
        },
      };
      const result = await orderCollections.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });
    app.put("/update-note-seller/:id", async (req, res) => {
      const id = req.params.id;
      const updateOrder = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          noteAddedBySeller: updateOrder.noteAddedBySeller,
          sellerAddedNote: updateOrder.sellerAddedNote,
        },
      };
      const result = await orderCollections.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.put("/payment-cancelled/:id", async (req, res) => {
      const id = req.params.id;
      const updateOrder = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          paymentStatus: updateOrder.paymentStatus,
        },
      };
      const result = await orderCollections.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.put("/payment-received/:id", async (req, res) => {
      const id = req.params.id;
      const updateOrder = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          paymentStatus: updateOrder.paymentStatus,
        },
      };

      const result = await orderCollections.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.put("/user-review/:id", async (req, res) => {
      const id = req.params.id;
      const updateOrder = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          productReview: updateOrder.productReview,
        },
      };

      const result = await orderCollections.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    /*  logoCollections */

    app.post("/add-logo", async (req, res) => {
      const logo = req.body;
      const result = await logoCollections.insertOne(logo);
      res.send(result);
    });

    app.get("/logo", async (req, res) => {
      const query = {};
      const cursor = logoCollections.find(query);
      const logo = await cursor.toArray();
      res.send(logo);
    });
    app.get("/logo/:id", async (req, res) => {
      const query = {};
      const cursor = logoCollections.find(query);
      const logo = await cursor.toArray();
      res.send(logo);
    });

    app.put("/logo/:id", async (req, res) => {
      const id = req.params.id;
      const updateData = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          logo: updateData.logo,
        },
      };

      const result = await logoCollections.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    /* BannerOptionCollections */

    app.post("/add-banner", async (req, res) => {
      const banner = req.body;
      const result = await BannerOptionCollections.insertOne(banner);
      res.send(result);
    });

    app.get("/banner", async (req, res) => {
      const query = {};
      const cursor = BannerOptionCollections.find(query);
      const banner = await cursor.toArray();
      res.send(banner);
    });
    app.get("/banner/:id", async (req, res) => {
      const query = {};
      const cursor = BannerOptionCollections.find(query);
      const banner = await cursor.toArray();
      res.send(banner);
    });

    app.put("/edit-banner/:id", async (req, res) => {
      const id = req.params.id;
      const updateBanner = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          bannerTitle: updateBanner.bannerTitle,
          bannerPara: updateBanner.bannerPara,
          bannerText: updateBanner.bannerText,
          bannerUrl: updateBanner.bannerUrl,

          bannerBottomLink: updateBanner.bannerBottomLink,
          bannerBottomLinkText: updateBanner.bannerBottomLinkText,

          TitleBoxOne: updateBanner.TitleBoxOne,
          ParaBoxOne: updateBanner.ParaBoxOne,
          ImageBoxOne: updateBanner.ImageBoxOne,

          TitleBoxTwo: updateBanner.TitleBoxTwo,
          ParaBoxTwo: updateBanner.ParaBoxTwo,
          ImageBoxTwo: updateBanner.ImageBoxTwo,

          TitleBoxThree: updateBanner.TitleBoxThree,
          ParaBoxThree: updateBanner.ParaBoxThree,
          ImageBoxThree: updateBanner.ImageBoxThree,
        },
      };

      const result = await BannerOptionCollections.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    /* contact us message */

    app.post("/add-contact-message", async (req, res) => {
      const contact = req.body;
      const result = await ContactMessageCollections.insertOne(contact);
      res.send(result);
    });

    app.get("/contact-messages", async (req, res) => {
      try {
        const { status } = req.query; // Assuming you pass status as a query parameter
        const query = status ? { messageStatus: status } : {}; // If status is provided, filter by it
        const cursor = ContactMessageCollections.find(query);
        const contactMessages = await cursor.toArray();
        res.send(contactMessages);
      } catch (error) {
        console.error("Error retrieving contact messages:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.get("/contact-message/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const contact = await ContactMessageCollections.findOne(query);
      res.send(contact);
    });

    app.put("/contact-message/:id", async (req, res) => {
      const id = req.params.id;
      const contact = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          messageStatus: contact.messageStatus,
        },
      };
      const result = await ContactMessageCollections.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running Marketplace Server");
});

app.listen(port, () => {
  console.log("Listing to Port", port);
});
