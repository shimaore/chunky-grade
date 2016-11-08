    windy_moon = require 'windy-moon'

    {digits,boolean,array,timezone,language,optional} = require 'windy-moon/types'

    cf = (name) ->
      (v,doc) ->
        if doc["cf#{name}_enabled"] and not doc["cf#{name}_voicemail"]
          digits v
        else
          optional digits v

    text = (v) ->
      typeof v is 'string'

    number = (v) ->
      typeof v is 'number'

    any = (args...) ->
      (v,doc) ->
        for a in args
          return true if a v,doc
        return false

    module.exports = validate_doc_update = windy_moon.main ->

User authorization
------------------

      return if @is_design

      if not @is 'provisioning_writer' and not @is_admin
        @unauthorized "Not authorized to write in this database, roles = #{@roles?.join(",")}."

Data validation
---------------

      validate_format = =>
        switch @validate_type()

          when 'local-number'
            @required 'account'
            @required 'endpoint'
            @validate_fields
              account: string
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

              endpoint: text
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

          when 'global-number'
            @required 'account'
            @validate_fields
              account: string
              fs_variables: optional string
              language: optional text
              local_number: optional text
              # outbound_route: optional number # hmm probably not anymore??
              regisrant_host: optional string
              registrant_password: optional string
              registrant_realm: optional string
              registrant_remote_ipv4: optional string
              registrant_socket: optional string
              registrant_username: optional string
              timezone: optional timezone
              voicemail_main: optional boolean
              voicemail_number_domain: optional string

          when 'endpoint'
            @required 'account'
            @required 'ratings'
            @required 'number_domain'

            @validate_fields
              account: text
              ratings: object
              timezone: optional string
              max_channels: optional number
              password: optional string
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
              number_domain: text
              outbound_domain: optional text
              privacy: optional boolean
              require_same_auth: optional boolean
              src_disabled: optional boolean

          ###
          when 'carrier'
            @require 'carrierid'
            @validate_fields
              carrier: optional text
              carrierid: text
              disabled: optional boolean
              TBD
          ###


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
