
-------------------------------------------

- previous user sendings persist

    @20170401
        logout user1 and login user2, keeps showing sendings of user1

    issue
        sendingService user does not update after login
    
    fix
        set method setUser() public 
        call setUser() from sendings

-------------------------------------------

- gray box top  left 

    .scroll-content {
        overflow-y:auto;
    }    

--------------------------------------------

    


    