import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import Dropzone from 'react-dropzone'
import Axios from 'axios'
import geolocationUrl from '../Services/Geolocation'
import api from '../Services/ApiHelper'
import './Uploader.scss'


class Uploader extends Component {
  constructor(props) {
    super(props)

    const { id, city, country, summary, latitude, longitude, Images } = this.props.location.location || this.props.location
    this.state = {
      uploading: false,
      images: Images || [],
      images_new: [],
      previewImages: [],
      submitted: false,
      redirect: false,
      uploading: false,
      id,
      data: null,
      city,
      country,
      summary,
      latitude,
      longitude,

    }
  }

  async componentDidMount() {
    this.getGeoLocationInfo()
  }

  async componentDidUpdate() {
    // this.getGeoLocationInfo()  
  }

  async getGeoLocationInfo() {
    if (this.props.location.latitude) {
      try {
        // const resp = await Axios(geolocationUrl + `key=${process.env.REACT_APP_GEOLOCATION_KEY}&q=${this.props.location.latitude.toFixed(6)}%2C${this.props.location.longitude.toFixed(6)}&pretty=1`)
        // const resp = await Axios(`http://api.positionstack.com/v1/reverse?access_key=${process.env.REACT_APP_GEOLOCATION_KEY2}&query=40.7638435,-73.9729691`)
        // const { country, city, county, village } = resp.data.results[0].locations[0]
        //     const { country, county, locality} = resp.data[0]

        const resp = await Axios(`${geolocationUrl}key=${process.env.REACT_APP_GEOLOCATION_KEY3}&location=${this.props.location.latitude.toFixed(6)},${this.props.location.longitude.toFixed(6)}&includeRoadMetadata=true&includeNearestIntersection=true`)
        console.log(resp)
        if (resp) {

          const { adminArea1, adminArea5, adminArea6 } = resp.data.results[0].locations[0]
          const country = await Axios(`https://restcountries.eu/rest/v2/alpha?codes=${adminArea1}`)

          this.setState({
            country: country.data[0].name || adminArea1 || '',
            city: adminArea5 || adminArea6 || ''
          })
        }
      } catch (err) {
        console.log(err)
      }
    }
  }

  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    });
  };

  handleSubmit = async event => {
    event.preventDefault()
    this.setState({ uploading: true })
    const { city, country, summary, latitude, longitude, images } = this.state
    const resp = await api.post(
      "/locations",
      {
        city,
        country,
        summary,
        latitude,
        longitude,
        images
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    )

    this.setState({
      uploading: false,
    })
    this.props.history.push({
      pathname: '/',
      images: images
    })
    return resp
  }


  handleUpdate = async event => {
    event.preventDefault();
    this.setState({ uploading: true })
    const { id, city, country, summary, latitude, longitude, images } = this.state
    const resp = await api.put(
      "/locations/" + id,
      {
        city,
        country,
        summary,
        latitude,
        longitude,
        images
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    )
    this.setState({
      uploading: false,
    })
    this.props.history.push({
      pathname: '/',
      images: images
    })
    return resp
  }

  deletePhoto = async (e) => {
    let id = e.target.getAttribute('id')
    let name = e.target.getAttribute('value')
    try {
      const deleteImage = await api.delete('/images/' + id)
      let images = this.state.images.filter((elem) => {
        if (elem.name !== name) {
          return e
        }
      })
      this.setState({ images: images })

      let images_new = this.state.images_new.filter((elem) => {
        if (elem.name !== name) {
          return e
        }
      })
      this.setState({ images_new: images_new })
    }
    catch (err) {
      console.log(err)
    }
  }

  // https://stackoverflow.com/questions/36280818/how-to-convert-file-to-base64-in-javascript
  // https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
  //accepted - array of imgs
  onDrop = accepted => {
    console.log(accepted)
    // let previewImages = [];
    // previewImages.push(this.state.images)

    // for (let i in accepted) {
    //   previewImages.push({ accepted });
    // }

    // this.setState({ previewImages: previewImages });
    accepted.forEach(file => {
      console.log(file)
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        this.setState(state => ({
          images: [
            ...state.images,
            {
              name: file.name,
              imageBase64: reader.result,
              locationId: this.state.id
            }
          ]
        }))

        // console.log(reader.result)
        this.setState(state => ({
          images_new: [
            ...state.images_new,
            {
              name: file.name,
              imageBase64: reader.result,
              locationId: this.state.id
            }
          ]
        }))
      });
      reader.readAsDataURL(file);
    });
    // console.log(previewImages)
  };



  render() {
    const { images } = this.state;
    const hasImages = images.length > 0;


    return (
      <div className="uploader">
        {/* {redirectToList} */}
        <form className="add-location-form" onSubmit={this.props.update === true ? this.handleUpdate : this.handleSubmit}>
          <div className="fields">
            <div className="field">
              {/* <label className="name">City: </label> */}
              <input
                type="text"
                placeholder={this.props.passer === 'modalUpdate' ? this.state.city : 'city'}
                name="city"
                value={'' || this.state.city}
                onChange={this.handleChange}
              />
            </div>
            <div className="field">
              {/* <label className="country">Country: </label> */}
              <input
                type="text"
                placeholder={this.props.passer === 'modalUpdate' ? this.state.country : "Country"}
                name="country"
                value={this.state.country}
                onChange={this.handleChange}
              />
            </div>
            <div className="field">
              {/* <label className="summary">Summary: </label> */}
              <textarea
                placeholder={this.props.passer === 'modalUpdate' ? this.state.summary : "Description"}
                name="summary"
                value={this.state.summary}
                onChange={this.handleChange}
              />
            </div>
          </div>

          <div className="dropzoneWrapper">
            <div className="dropzone-and-button">
              <Dropzone
                maxSize={2000000}
                accept="image/jpeg, image/png, image/jpg"
                onDrop={this.onDrop}
              >
                {({ getRootProps, getInputProps, isDragActive }) => {
                  return (
                    <div {...getRootProps()} className="dropzone">
                      <input {...getInputProps()} />
                      {isDragActive ? (
                        <p>Drop files here...</p>
                      ) : (
                          <p>Drop images here, or click to upload.</p>
                        )}
                    </div>
                  );
                }}
              </Dropzone>

              <div className="button">
                <button type="submit">{this.state.uploading ? '...uploading' : 'Submit'}</button>
              </div>
            </div>
            {hasImages && (
              <div className="imagePreview">
                {images.map((image, index) => (
                  <div className="img-wrapper">

                    <img key={index} src={image.imageBase64} />
                    <i className="fas fa-times-circle" onClick={this.deletePhoto} name="name" id={image.id} value={image.name}></i>
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
      </div>
    );
  }
}

export default withRouter(Uploader);
