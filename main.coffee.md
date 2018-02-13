    windy_moon = require 'windy-moon'
    {digits,number,text,boolean,array,object,timezone,language,domain,cf,any,optional,required} = require 'windy-moon/types'

Validation for documents in the master provisioning database
------------------------------------------------------------

    ValidateFields =
      local_number:
        account: required text
        asserted_number: optional digits

        cfa_enabled: optional boolean
        cfa_number: cf 'a'
        cfa_voicemail: optional boolean
        cfb_enabled: optional boolean
        cfb_number: cf 'b'
        cfb_voicemail: optional boolean
        cfda_enabled: optional boolean
        cfda_number: cf 'da'
        cfda_voicemail: optional boolean
        cfnr_enabled: optional boolean
        cfnr_number: cf 'nr'
        cfnr_voicemail: optional boolean
        country: optional text
        custom_music: optional any boolean, text
        custom_ringback: optional any boolean, text
        dialog_timer: optional digits
        dialplan: optional text
        disabled: optional boolean
        endpoint: required text
        endpoint_via: optional domain
        inv_timer: optional digits
        list_to_voicemail: optional boolean
        location: optional text
        ornaments: optional array
        privacy: optional boolean
        reject_anonymous: optional boolean
        reject_anonymous_to_voicemail: optional boolean
        ring_ready: optional boolean
        timezone: optional timezone
        use_blacklist: optional boolean
        use_whitelist: optional boolean
        user_database: optional text
        vacation: optional object

      global_number:
        account: text
        fs_variables: optional text
        language: optional text
        local_number: optional text
        # outbound_route: optional number # hmm probably not anymore??
        regisrant_host: optional text
        registrant_password: optional text
        registrant_realm: optional text
        registrant_remote_ipv4: optional text
        registrant_socket: optional text
        registrant_username: optional text
        timezone: optional timezone
        voicemail_main: optional boolean
        voicemail_number_domain: optional text

      endpoint:
        account: required text
        ratings: required object
        timezone: optional text
        display_name: optional text
        max_channels: optional number
        password: optional text
        rate_limit: optional number
        # sbc
        user_force_mp: optional boolean
        user_ip: optional text

Destination endpoint

        disabled: optional boolean
        dst_disabled: optional boolean
        user_srv: optional text
        user_via: optional text

Source endpoint

        asserted_number: optional text
        bypass_from_auth: optional boolean
        check_from: optional boolean
        check_ip: optional boolean
        country: optional
        dialog_timer: optional number
        dialplan: optional text
        disabled: optional boolean
        # inbound_sbc
        # keep_headers
        location: optional text
        number_domain: required text
        outbound_domain: optional text
        privacy: optional boolean
        require_same_auth: optional boolean
        src_disabled: optional boolean

      carrier:
        carrier: optional text
        carrierid: required text
        disabled: optional boolean
        # TBD

      number_domain:
        fifos: array

    TypeValidator =
      'local-number': ->
        @validate_fields ValidateFields.local_number

      'global-number': ->
        @required 'account'
        @validate_fields ValidateFields.global_number

      endpoint: ->
        @validate_fields ValidateFields.endpoint

      carrier: ->
        @validate_fields ValidateFields.carrier

      number_domain: ->
        @validate_fields ValidateFields.number_domain


    module.exports = validate_doc_update = windy_moon.main ->

User authorization
------------------

      return if @is_design

      # Authorize based on roles

      if not @is 'provisioning_writer' and not @is_admin
        @unauthorized "Not authorized to write in this database, roles = #{@roles?.join(",")}."

      # Authorize based on content / changes

State changes
-------------

      switch @event
        when 'create'
          validate_format()

        when 'delete'
          forbidden 'Use disabled:true instead of deleting'

        when 'modify'
          validate_format()
          prevent_unwanted_changes()

Data validation
---------------

      @validate_type()

      unless @type of TypeValidators
        @forbidden "Unknown type #{@type}"

      validators = (@doc.validators ? []).map (v) =>
        @assert v of KnownValidators, "Unknown validator #{v}"
        KnownValidators[v]

      validators.push TypeValidators[type]

      @validate validators

      # OK, everything is fine!
      return
