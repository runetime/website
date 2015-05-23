@extends('layouts.default')
@section('contents')
<div class='wrapper-dark'>
    <img src='/img/clan/header.png' class='img-responsive center-block' alt='RuneTime Clan' />
</div>
<div class='container container-dark'>
    <h3>
        @lang('clan.join.header')
    </h3>
    <p>
        @lang('clan.join.text')
    </p>
</div>
<div class='container container-dark'>
    <h3>
        @lang('clan.info.header')
    </h3>
    <p>
        @lang('clan.info.text')
    </p>
    <div class='row'>
        <div class='col-xs-12 col-sm-4'>
            <button class='trigger dialog-button dialog-orange' data-dialog='clan-dialog-warnings'>
                Warnings
            </button>
        </div>
        <div class='col-xs-12 col-sm-4'>
            <button class='trigger dialog-button dialog-orange' data-dialog='clan-dialog-temporary-bans'>
                Temporary Bans
            </button>
        </div>
        <div class='col-xs-12 col-sm-4'>
            <button class='trigger dialog-button dialog-orange' data-dialog='clan-dialog-bans'>
                Bans
            </button>
        </div>
    </div>
</div>
<div id='clan-dialog-warnings' class='dialog'>
    <div class='dialog__overlay'></div>
    <div class='dialog__content'>
        <h2>
            Warnings
        </h2>
        <h4>
            @lang('clan.offenses.arguing')
        </h4>
        <h4>
            @lang('clan.offenses.flaming')
        </h4>
        <h4>
            @lang('clan.offenses.spamming')
        </h4>
        <div>
            <button class='action dialog-button dialog-orange' data-dialog-close>
                Close
            </button>
        </div>
    </div>
</div>
<div id='clan-dialog-temporary-bans' class='dialog'>
    <div class='dialog__overlay'></div>
    <div class='dialog__content'>
        <h2>
            Temporary Bans
        </h2>
        <h4>
            @lang('clan.offenses.put_down')
        </h4>
        <h4>
            @lang('clan.offenses.warnings_3')
        </h4>
        <h4>
            @lang('clan.offenses.warnings_6')
        </h4>
        <div>
            <button class='action dialog-button dialog-orange' data-dialog-close>
                Close
            </button>
        </div>
    </div>
</div>
<div id='clan-dialog-bans' class='dialog'>
    <div class='dialog__overlay'></div>
    <div class='dialog__content'>
        <h2>
            Bans
        </h2>
        <h4>
            @lang('clan.offenses.discrimination')
        </h4>
        <h4>
            @lang('clan.offenses.racism')
        </h4>
        <h4>
            @lang('clan.offenses.sexism')
        </h4>
        <h4>
            @lang('clan.offenses.warnings_9')
        </h4>
        <div>
            <button class='action dialog-button dialog-orange' data-dialog-close>
                Close
            </button>
        </div>
    </div>
</div>
<script>
    clan = new Clan();
</script>
@stop
