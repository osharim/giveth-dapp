import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { feathersClient } from '../../lib/feathersClient'
import { Link } from 'react-router-dom'
import { isAuthenticated, redirectAfterWalletUnlock } from '../../lib/middleware'
import Loader from '../Loader'
import { getTruncatedText } from '../../lib/helpers'


import Avatar from 'react-avatar'
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"

/**
  The my campaings view
**/

class MyCampaigns extends Component {
  constructor() {
    super()

    this.state = {
      isLoading: true,
      campaigns: [],
      pendingCampaigns: [],
    }    
  }

  componentDidMount() {
    isAuthenticated(this.props.currentUser, this.props.history).then(() =>
      feathersClient.service('campaigns').find({query: { ownerAddress: this.props.currentUser }})
        .then((resp) =>
          this.setState({ 
            campaigns: resp.data.filter(campaign => (campaign.projectId)),
            pendingCampaigns: resp.data.filter(campaign => !(campaign.projectId)),
            hasError: false,
            isLoading: false
          }))
        .catch(() => 
          this.setState({ 
            isLoading: false, 
            hasError: true 
          }))
    )   
  }


  removeCampaign(id){
    React.swal({
      title: "Delete Campaign?",
      text: "You will not be able to recover this Campaign!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, delete it!",
      closeOnConfirm: true,
    }, () => {
      const campaigns = feathersClient.service('/campaigns');
      campaigns.remove(id).then(campaign => {
        React.toast.success("Your Campaign has been deleted.")
      })
    });
  }

  editCampaign(id) {
    React.swal({
      title: "Edit Campaign?",
      text: "Are you sure you want to edit this Campaign?",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, continue editing!",
      closeOnConfirm: true,
    }, () => redirectAfterWalletUnlock("/campaigns/" + id + "/edit", this.props.wallet, this.props.history));
  }  


  render() {
    let { campaigns, pendingCampaigns, isLoading } = this.state

    return (
      <div id="campaigns-view">
        <div className="container-fluid page-layout">
          <div className="row">
            <div className="col-md-12">
              <h1>Your Campaigns</h1>

              { isLoading && 
                <Loader className="fixed"/>
              }

              { !isLoading &&
                <div>
                  {pendingCampaigns.length > 0 &&
                    <p>{pendingCampaigns.length} pending campaigns</p>
                  }

                  { campaigns && campaigns.length > 0 && 
                    <ResponsiveMasonry columnsCountBreakPoints={{350: 1, 750: 2, 900: 3, 1024: 4, 1470: 5}}>
                      <Masonry gutter="10px"> 
                        { campaigns.map((campaign, index) =>

                          <div className="card" id={campaign._id} key={index}>
                            <img className="card-img-top" src={campaign.image} alt=""/>
                            <div className="card-body">
                            
                              <Link to={`/profile/${ campaign.owner.address }`}>
                                <Avatar size={30} src={campaign.owner.avatar} round={true}/>                  
                                <span className="small">{campaign.owner.name}</span>
                              </Link>

                              <Link to={`/campaigns/${ campaign._id }`}>
                                <h4 className="card-title">{getTruncatedText(campaign.title, 30)}</h4>
                              </Link>
                              <div className="card-text">{campaign.summary}</div>

                              <div>
                                <a className="btn btn-link" onClick={()=>this.removeCampaign(campaign._id)}>
                                  <i className="fa fa-trash"></i>
                                </a>
                                <a className="btn btn-link" onClick={()=>this.editCampaign(campaign._id)}>
                                  <i className="fa fa-edit"></i>
                                </a>
                              </div>

                            </div>
                          </div>
                        )}
                      </Masonry>
                    </ResponsiveMasonry>                    
                  }
                

                  { campaigns && campaigns.length === 0 &&
                    <center>You didn't create any campaigns yet!</center>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default MyCampaigns

MyCampaigns.propTypes = {
  currentUser: PropTypes.string,
  history: PropTypes.object.isRequired
}