const messages = {
  en: {
    user: {
    orderPlaced: {
      title: "Order Placed",
      body: "Order ID: {orderId} has been placed successfully."
    },
    orderCancelled: {
      title: "Order Cancelled",
      body: "Order ID: {orderId} has been cancelled by User ID {userId}."
    },
    newJob: {
      title: "New Job arrived",
      body: "A new job has arrived."
    },
    bonusPoint: {
      title: "Got Bonus Points",
      body: "Your referral code was used by {firstName} {lastName}"
    },
     tipPaid: {
      title: "Tip Paid",
      body: "{negAmount} tip has been paid to you."
    },
     groupOrder: {
      title: "Group Order",
      body: "Group Order Placed."
    },
    groupJoined: {
      title: "Group Joined!",
      body: "{firstName} {lastName} has joined the group."
    },
     requestCancelled: {
      title: "Request Cancelled",
      body: "Table Booking Request has been cancelled by User ID: {userId}."
    },
     tableBookingRequest: {
      title: "Request for Book a Table",
      body: "{firstName} {lastName} made a request to book a table with {noOfMembers} members."
    },
      },
      
      retailer:{
        orderAccepted: {
        title: "Order Accepted",
        body: "Order ID: {orderId} has been accepted by the restaurant."
      },
      orderRejected: {
        title: "Order Rejected",
        body: "Order ID: {orderId} has been rejected due to {title}."
      },
       orderDelivered: {
        title: "Order Delivered",
        body: "Order Number {orderNum} has been delivered."
      },
       newJobArrived: {
        title: "New Job Arrived",
        body: "You have been assigned to Order ID: {orderId}."
      },
       readyForPickup: {
        title: "Ready for Pickup",
        body: "Order ID: {orderId} is ready for pickup."
      },
       orderAcceptedByRestaurant: {
        title: "Order accepted by restaurant",
        body: "Your order will be prepared soon."
      },
       orderIsPreparing: {
        title: "Order is preparing",
        body: "Your food is being prepared."
      },
        orderPrepared: {
        title: "Order prepared",
        body: "Pick up your food."
      },
       orderCancelled: {
        title: "Order cancelled",
        body: "Restaurant is unable to process your order. Please try later."
      },
        acceptTableRequest: {
        title: "Accept Request",
        body: "Your request for table booking is accepted by {businessName} restaurant."
      },
        cancelledTableRequest: {
        title: "Cancelled Request",
        body: "Your request for table booking is cancelled by {businessName} restaurant."
      },
         newJobRequestArrived: {
        title: "A new Job Arrived",
        body: "New Order Request ID: {orderId}."
      },
      orderStatusChanged: {
        title: "Order Status Changed",
        body: "Table Booking ID: {id} status has been changed to {status}."
      },
        invitation: {
        title: "Invitation",
        body: "You are invited by {businessName} restaurant."
      }
          
      },
   driver:{
    referralUsed: {
    title: "Get Bonus Points",
    body: `Your referral code was used by Driver ID: {userId}`
  },
    orderAccepted: {
    title: "Order Accepted by Driver",
    body: `Order No: {orderNum} accepted!`
  },
   driverarrived:{
       title: "Driver Reached",
     body: "Rider is arrived",
  },
  driverpickedfood:{
       title: "Driver Pickedup Food",
      body: "Food picked up by rider. Hang on",
  },
  driveratdoorstep:{
        title: "Driver at Doorstep",
        body: "Rider is at your location. Please collect your order"
  },
  riderontheway:{
       title: "Ride On The Way",
       body: "Rider on your way. Arriving soon",
  },
  orderdelivered:{
      title: "Order Delivered",
      body: `Order Number : {orderNum} has been delivered`
  },
  ridestarted:{
      title: "Ride started",
      body: "Rider is on his way. Please hang on."
  },
  ridecancelled:{
       title: "Ride Cancelled",
       body: "Ride cancelled",
  },
  rideend:{
       title: "Ride End",
        body: "Your ride end now",
  },
  orderdeclined:{
      title:"Order Decline",
      body: "Driver delcine your Order ID : {orderId}"
  },
  payoutrequest:{
      title: "Payout Request",
      body: "Payout request from Driver : {firstName} {lastName} with amount of CHF:{amount}"
  }
  
  
      }
      
      
  },
  ger: {
     user: {
    orderPlaced: {
      title: "Bestellung aufgegeben",
      body: "Bestell-ID: {orderId} wurde erfolgreich aufgegeben."
    },
    orderCancelled: {
      title: "Bestellung storniert",
      body: "Bestell-ID: {orderId} wurde von Benutzer-ID {userId} storniert."
    },
    newJob: {
      title: "Neuer Job angekommen",
      body: "Ein neuer Job ist da."
    },
      bonusPoint: {
      title: "Bonuspunkte erhalten",
      body: "Ihr Empfehlungscode wurde verwendet von"
    },
     tipPaid: {
      title: "Bezahltes Trinkgeld",
      body: "{negAmount} Trinkgeld wurde an Sie gezahlt."
    },
     groupOrder: {
      title: "Gruppenauftrag",
      body: "Gruppenauftrag platziert."
    },
    groupJoined: {
      title: "Gruppe beigetreten!",
      body: "{Vorname} {Nachname} ist der Gruppe beigetreten."
    },
     requestCancelled: {
      title: "Antrag storniert",
      body: "Tischbuchungsanfrage wurde storniert von Benutzer-ID: {userId}."
    },
     tableBookingRequest: {
      title: "Anfrage für Tischreservierung",
      body: "{Vorname} {Nachname} hat eine Anfrage zur Buchung eines Tisches mit {AnzahlMitglieder} Mitgliedern gestellt."
    },
  },
  retailer:{
        orderAccepted: {
        title: "Bestellung angenommen",
        body: "Bestell-ID: {orderId} wurde vom Restaurant angenommen."
      },
         orderRejected: {
        title: "Bestellung abgelehnt",
        body: "Bestell-ID: {orderId} wurde abgelehnt aufgrund von {title}."
      },
       orderDelivered: {
        title: "Bestellung Geliefert",
        body: "Bestellnummer {orderNum} wurde geliefert."
      },
       newJobArrived: {
        title: "Neuer Job eingetroffen",
        body: "Sie wurden der Auftrags-ID zugewiesen: {orderId}."
      },
       readyForPickup: {
        title: "Bereit zur Abholung",
        body: "Bestell-ID: {orderId} steht zur Abholung bereit."
      },
     orderAcceptedByRestaurant: {
        title: "Bestellung im Restaurant angenommen",
        body: "Ihre Bestellung wird in Kürze vorbereitet."
      },
       orderIsPreparing: {
        title: "Der Auftrag bereitet",
        body: "Ihr Essen wird zubereitet."
      },
        orderPrepared: {
        title: "Bestellung vorbereitet",
        body: "Holen Sie Ihr Essen ab."
      },
       orderCancelled: {
        title: "Auftrag storniert",
        body: "Das Restaurant kann Ihre Bestellung nicht bearbeiten. Bitte versuchen Sie es später."
      },
        acceptTableRequest: {
        title: "Antrag annehmen",
        body: "Ihre Anfrage für eine Tischreservierung wird vom Restaurant {Betriebsname} angenommen."
      },
        cancelledTableRequest: {
        title: "Annullierter Antrag",
        body: "Ihre Anfrage für eine Tischreservierung wird von {Betriebsname} Restaurant storniert."
      },
          newJobRequestArrived: {
        title: "Ein neuer Job ist da",
        body: "Neue Bestellanforderung ID: {orderId}."
      },
      orderStatusChanged: {
        title: "Status der Bestellung geändert",
        body: "Tabelle Buchungs-ID: {id} Status wurde geändert in {status}."
      },
        invitation: {
        title: "Einladung",
        body: "Sie sind eingeladen von {Betriebsname} Restaurant."
      }
  },
     driver:{
    referralUsed: {
    title: "Bonuspunkte erhalten",
    body: `Ihr Empfehlungscode wurde verwendet von Fahrer ID: {userId}`
  },
    orderAccepted: {
    title: "Vom Fahrer angenommener Auftrag",
    body: `Bestellnummer: {orderNum} akzeptiert!`
  },
   driverarrived:{
       title: "Erreichter Fahrer",
     body: "Reiter ist angekommen",
  },
  driverpickedfood:{
       title: "Fahrer holt Lebensmittel ab",
      body: "Essen wird vom Fahrer abgeholt. Aufhängen",
  },
  driveratdoorstep:{
        title: "Fahrer an der Türschwelle",
        body: "Der Fahrer ist an Ihrem Standort. Bitte holen Sie Ihre Bestellung ab"
  },
  riderontheway:{
       title: "Fahrt auf dem Weg",
       body: "Reiter auf dem Weg. Bald eintreffend",
  },
  orderdelivered:{
      title: "Bestellung Geliefert",
      body: `Bestellnummer : {orderNum} wurde geliefert`
  },
  ridestarted:{
      title: "Fahrt gestartet",
      body: "Rider ist auf dem Weg. Bitte bleiben Sie dran."
  },
  ridecancelled:{
       title: "Fahrt abgesagt",
       body: "Fahrt abgesagt",
  },
  rideend:{
       title: "Fahrtende",
        body: "Ihre Fahrt endet jetzt",
  },
  orderdeclined:{
      title:"Auftragsrückgang",
      body: "Fahrer geben Sie Ihre Bestell-ID an: {orderId}"
  },
  payoutrequest:{
      title: "Auszahlungsantrag",
      body: "Auszahlungsantrag von Fahrer : {Vorname} {Nachname} mit Betrag von CHF:{Betrag}"
  }
  
      }
}
}

module.exports = messages;
