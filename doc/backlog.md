# backlog onefleet

## **Short description- what is this app for?**

In the Central Mediterranean, there are many different actors involved in Search-and-Rescue operations. The app aims for a better coordination and smoother communication about boats in maritime distress between all the involved organisations and networks, be it ships or airplaens. 
Also the app will be used to collect more data and information on the incidents in the Mediterranean and provide the public with this information. E.g. this can be used by journalists or researchers.

**How should that work?**
If we get knowledge about a boat in distress, this boat should become a case/item in the map. Either it can be typed in manually or is added through the drop points from the aircraft. 

## **Add**
- add a new case, vehicle or landmark (e.g. oil platforms)
- depending on what you are adding, different templates with lines to fill in (such as latitude/longitude, boat type, people on board (pob)) will show up 

## **Map**
In the map are shown: 
***Must have***
- territorial waters (TTW) 
- Search and Rescue Regions (SRR/SAR)
- all ships in a certain area (between Libya/Lampedusa/Malta)
- Cases (DCs) (as long as they are open!)
- a/c as long as they are airborne (incl. altitude!) -> tracked via IRIDIUM Go
- tracks of ships/a/c/cases! 
- ships/aircraft/cases should appear in different icons, to be able to keep an overview
- ships/aircrafts/cases -> show name/time/position when mouse hover over an icon
- "sightings" such as warships/coastguard ships, which can be added manually 

***Nice to have***
- current weather (wind/waves e.g. from windy.com)
- mobile phone coverage (if possible?)
-  calculation of further track of DCs, calculating with Speed over Ground (SOG) and Course over Ground (COG) 
    -   e.g: a boat got spotted by Moonbird in a certain position, COG= 016°, SOG= 5 knots-> where will this boat be in 2hrs? 

**TOOLS for Map**
- measurement tools (how many nautical miles (nm) is a boat away from the coast/from a ship/from TTW) 
- drawing tools (such as rectangle) with which you can search for historical AIS data for a certain region
    - reason: to check if merchant vessel have been close to a DC but did not render assistance-> important for legal cases
- search for a certain location by entering coordinates in different formats
    - reason: sometimes specially AP is not sure about the coordinate format given by boatpeople -> by checking different options of a position, thing are often getting clearer (e.g: boatpeople tell us, they left from Zuwara, DMS position might be correct while decimal or degrees is impossible) 

## **List**
- shows all collected vehicles (rename), cases, sightings
- Dates are still missing

***Nice to have***
- possibility to search for cases in a certain timeframe/area/...

## **Left Navigation**
Left navigation shows the following in this order: 

**Cases**
- show current cases (closed cases should be transfered  into the historical database always at midnight -> this gives us the possibility to have an overview on the cases of the day)
- possibility to edit and delete cases
- possibility to track ONE case (have different positions for one and the same boat) 
    - e.g: Moonbird spots a boat at 1203Z in pos xx.xx.xxx. After one hour at 1307Z Moonbird spots the SAME boat again in pos xx.xy.yyy. This should then not appear as different cases in the app, but this boat will become a casenumber (DC115) and should be tracked with this number until closed. 
- it would be a *nice to have* if the different cases of one day could have either different colors or different icons or the DCnumbers visible on first sight in order to be able to keep an overview on busy days with up to 7-10 different boats in distress

**Landmarkus**
- same structure as cases:
- show current landmark/sighting (closed sightings should be transfered into the historical database always at midnight)
- possibility to edit and delete sightings
- should have different icon than cases

**Vehicles**
Make a difference between the following ??:
   - civil fleet
   - merchant/commercial
    - Air assets/aircrafts

## **Top right**
**AIR**
- show altitude diagram of a/c operated
- 

**Admin**
- Settings
- Logout

**Settings**
- Change Map type 
- Show/Dont show Title of Item in the map
- Show track of 
    - last "n" hours
    - from date to date
    - last "n" tracks
"n" like the parameter in mathematics

## **Export**
When clicking on an item (like vehicle) you can export the location.
Way to export items within daterange (with replay mode)

## **Development**
Changelog

- v0.0.1
First release

- v0.0.2
Settings - show track from startdate to enddatee

